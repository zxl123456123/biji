use super::{initialize_database, load_from_connection, save_to_connection, AppData, Note, Todo, Transaction};
use rusqlite::{params, Connection};
use serde_json::{json, Value};

fn note(id: &str, created_at: &str) -> Note {
  Note { id: id.into(), content: format!("正文 {id} #测试"), status: "none".into(),
    created_at: created_at.into(), updated_at: Some("2026-10-04T09:00:00Z".into()),
    scheduled_date: Some("2026-10-05".into()), done: false, deleted_at: None, pinned: false }
}

fn transaction() -> Transaction {
  Transaction { id: "transaction-one".into(), amount: 12.5, category: "餐饮".into(),
    note: "隔离测试账目".into(), kind: "expense".into(), created_at: "2026-10-04T08:00:00Z".into(),
    updated_at: Some("2026-10-04T09:00:00Z".into()) }
}

fn data() -> AppData {
  let mut first = note("oldest", "2026-10-01T08:00:00Z");
  first.pinned = true;
  let mut trash = note("trash", "2026-10-04T08:00:00Z");
  trash.done = true;
  trash.deleted_at = Some("2026-10-04T10:00:00Z".into());
  trash.pinned = true;
  AppData { notes: vec![first, trash, note("middle", "2026-10-03T08:00:00Z")],
    transactions: vec![transaction()], todos: vec![Todo { id: "todo-one".into(), title: "今天要做的事".into(), due_date: "2026-10-06".into(), done: false, created_at: "2026-10-04T08:00:00Z".into(), updated_at: None }] }
}

fn legacy_connection(with_deleted_at: bool) -> Connection {
  let conn = Connection::open_in_memory().unwrap();
  let deleted_column = if with_deleted_at { ", deleted_at TEXT" } else { "" };
  conn.execute_batch(&format!(
    "CREATE TABLE notes (id TEXT PRIMARY KEY, content TEXT NOT NULL, status TEXT NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT, scheduled_date TEXT, done INTEGER NOT NULL{deleted_column});
     CREATE TABLE transactions (id TEXT PRIMARY KEY, amount REAL NOT NULL, category TEXT NOT NULL,
      note TEXT NOT NULL, kind TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT);"
  )).unwrap();
  for (id, date, done) in [("b", "2026-10-03T08:00:00Z", 1),
    ("a", "2026-10-03T08:00:00Z", 0), ("c", "2026-10-01T08:00:00Z", 0)] {
    conn.execute("INSERT INTO notes (id,content,status,created_at,updated_at,scheduled_date,done)
      VALUES (?1,?2,?3,?4,?5,?6,?7)", params![id, format!("旧正文 {id}"), "today", date,
        "2026-10-04T09:00:00Z", "2026-10-05", done]).unwrap();
  }
  if with_deleted_at {
    conn.execute("UPDATE notes SET deleted_at=?1 WHERE id='c'", ["2026-10-04T10:00:00Z"]).unwrap();
  }
  let item = transaction();
  conn.execute("INSERT INTO transactions VALUES (?1,?2,?3,?4,?5,?6,?7)",
    params![item.id, item.amount, item.category, item.note, item.kind, item.created_at, item.updated_at]).unwrap();
  conn
}

fn old_note_fields(conn: &Connection) -> Vec<Value> {
  let mut statement = conn.prepare("SELECT id,content,status,created_at,updated_at,scheduled_date,done FROM notes ORDER BY id").unwrap();
  statement.query_map([], |row| Ok(json!([
    row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
    row.get::<_, String>(3)?, row.get::<_, Option<String>>(4)?, row.get::<_, Option<String>>(5)?,
    row.get::<_, i64>(6)?
  ]))).unwrap().collect::<Result<Vec<_>, _>>().unwrap()
}

fn columns(conn: &Connection) -> Vec<String> {
  let mut statement = conn.prepare("SELECT name FROM pragma_table_info('notes') ORDER BY cid").unwrap();
  statement.query_map([], |row| row.get(0)).unwrap().collect::<Result<Vec<_>, _>>().unwrap()
}

fn positions(conn: &Connection) -> Vec<(String, i64, Option<i64>)> {
  let mut statement = conn.prepare("SELECT id,pinned,position FROM notes ORDER BY position IS NULL,position,created_at DESC,id").unwrap();
  statement.query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))).unwrap()
    .collect::<Result<Vec<_>, _>>().unwrap()
}

fn check_legacy_migration(with_deleted_at: bool) {
  let conn = legacy_connection(with_deleted_at);
  let before = old_note_fields(&conn);
  initialize_database(&conn).unwrap();
  initialize_database(&conn).unwrap();
  assert_eq!(old_note_fields(&conn), before);
  assert_eq!(columns(&conn), ["id", "content", "status", "created_at", "updated_at",
    "scheduled_date", "done", "deleted_at", "pinned", "position"]);
  let loaded = load_from_connection(&conn).unwrap();
  assert_eq!(loaded.notes.iter().map(|note| note.id.as_str()).collect::<Vec<_>>(), ["a", "b", "c"]);
  assert!(loaded.notes.iter().all(|note| !note.pinned));
  assert_eq!(positions(&conn), vec![("a".into(), 0, None), ("b".into(), 0, None), ("c".into(), 0, None)]);
  assert_eq!(loaded.notes[2].deleted_at.as_deref(),
    if with_deleted_at { Some("2026-10-04T10:00:00Z") } else { None });
  assert_eq!(serde_json::to_value(&loaded.transactions).unwrap(), json!([transaction()]));
}

#[test]
fn seven_column_database_preserves_old_fields_and_defaults_metadata() {
  check_legacy_migration(false);
}

#[test]
fn eight_column_database_preserves_trash_and_migrates_once() {
  check_legacy_migration(true);
}

#[test]
fn current_schema_reinitialization_preserves_array_order_pin_trash_and_transactions() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  let payload = data();
  let expected = serde_json::to_value(&payload).unwrap();
  save_to_connection(&mut conn, payload).unwrap();
  let stored_positions = positions(&conn);
  initialize_database(&conn).unwrap();
  initialize_database(&conn).unwrap();
  assert_eq!(columns(&conn).len(), 10);
  assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), expected);
  assert_eq!(positions(&conn), stored_positions);
  assert_eq!(stored_positions, vec![("oldest".into(), 1, Some(0)), ("trash".into(), 1, Some(1)),
    ("middle".into(), 0, Some(2))]);
}

#[test]
fn reordered_complete_array_round_trips_without_changing_note_fields() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  save_to_connection(&mut conn, data()).unwrap();
  let mut reordered = load_from_connection(&conn).unwrap();
  reordered.notes.reverse();
  let expected = serde_json::to_value(&reordered).unwrap();
  save_to_connection(&mut conn, reordered).unwrap();
  assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), expected);
  assert_eq!(positions(&conn), vec![("middle".into(), 0, Some(0)), ("trash".into(), 1, Some(1)),
    ("oldest".into(), 1, Some(2))]);
}

#[test]
fn positioned_rows_precede_legacy_rows_with_date_and_id_fallback() {
  let conn = legacy_connection(true);
  initialize_database(&conn).unwrap();
  conn.execute("UPDATE notes SET position=0,pinned=1 WHERE id='c'", []).unwrap();
  let loaded = load_from_connection(&conn).unwrap();
  assert_eq!(loaded.notes.iter().map(|note| note.id.as_str()).collect::<Vec<_>>(), ["c", "a", "b"]);
  assert!(loaded.notes[0].pinned);
  assert_eq!(loaded.notes[0].deleted_at.as_deref(), Some("2026-10-04T10:00:00Z"));
}

#[test]
fn failed_note_insert_rolls_back_notes_and_transactions() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  save_to_connection(&mut conn, data()).unwrap();
  let before = serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap();
  let before_positions = positions(&conn);
  let duplicate = note("duplicate", "2026-10-04T08:00:00Z");
  let payload = AppData { notes: vec![duplicate.clone(), duplicate], transactions: vec![], todos: vec![] };
  assert!(save_to_connection(&mut conn, payload).is_err());
  assert!(conn.is_autocommit());
  assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), before);
  assert_eq!(positions(&conn), before_positions);
}

#[test]
fn failed_transaction_insert_rolls_back_completed_note_inserts_and_both_tables() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  save_to_connection(&mut conn, data()).unwrap();
  let before = serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap();
  let before_positions = positions(&conn);
  let item = transaction();
  let payload = AppData { notes: vec![note("replacement", "2026-10-04T08:00:00Z")],
    transactions: vec![item.clone(), item], todos: vec![] };
  assert!(save_to_connection(&mut conn, payload).is_err());
  assert!(conn.is_autocommit());
  assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), before);
  assert_eq!(positions(&conn), before_positions);
}

#[test]
fn old_json_without_pin_deserializes_to_false_and_new_pin_round_trips() {
  let value = json!({ "version": 1, "notes": [{ "id": "old-json", "content": "旧备份正文",
    "status": "none", "createdAt": "2026-10-01T08:00:00Z", "done": false }],
    "transactions": [] });
  let mut payload: AppData = serde_json::from_value(value).unwrap();
  assert!(!payload.notes[0].pinned);
  assert!(payload.todos.is_empty());
  assert!(payload.notes[0].deleted_at.is_none());
  payload.notes[0].pinned = true;
  let value = serde_json::to_value(&payload).unwrap();
  assert_eq!(value["notes"][0]["pinned"], true);
  assert!(value["notes"][0].get("position").is_none());
  let round_trip: AppData = serde_json::from_value(value).unwrap();
  assert!(round_trip.notes[0].pinned);
}

#[test]
fn file_database_close_and_reopen_retains_array_metadata_and_transaction_fields() {
  let unique = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos();
  let path = std::env::temp_dir().join(format!("qingjian-order-test-{}-{unique}.db", std::process::id()));
  let payload = data();
  let expected = serde_json::to_value(&payload).unwrap();
  {
    let mut conn = Connection::open(&path).unwrap();
    initialize_database(&conn).unwrap();
    save_to_connection(&mut conn, payload).unwrap();
  }
  {
    let conn = Connection::open(&path).unwrap();
    initialize_database(&conn).unwrap();
    assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), expected);
    assert_eq!(positions(&conn), vec![("oldest".into(), 1, Some(0)), ("trash".into(), 1, Some(1)),
      ("middle".into(), 0, Some(2))]);
  }
  std::fs::remove_file(&path).unwrap();
}

#[test]
fn old_executable_save_preserves_independent_todos() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  save_to_connection(&mut conn, data()).unwrap();
  // Previous executables replace notes and transactions but do not touch the new table.
  conn.execute("DELETE FROM notes", []).unwrap();
  conn.execute("DELETE FROM transactions", []).unwrap();
  let loaded = load_from_connection(&conn).unwrap();
  assert_eq!(loaded.todos.len(), 1);
  assert_eq!(loaded.todos[0].title, "今天要做的事");
}

#[test]
fn failed_todo_insert_rolls_back_all_tables() {
  let mut conn = Connection::open_in_memory().unwrap();
  initialize_database(&conn).unwrap();
  save_to_connection(&mut conn, data()).unwrap();
  let before = serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap();
  let mut payload = data();
  payload.todos.push(payload.todos[0].clone());
  assert!(save_to_connection(&mut conn, payload).is_err());
  assert_eq!(serde_json::to_value(load_from_connection(&conn).unwrap()).unwrap(), before);
}
