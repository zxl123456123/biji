use keyring::Entry;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

const SERVICE: &str = "com.zxl.qingjian";
const ACCOUNT: &str = "deepseek_api_key";
const MODEL: &str = "deepseek-flash";
const API_URL: &str = "https://api.deepseek.com/chat/completions";

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Note { id: String, content: String, status: String, created_at: String, updated_at: Option<String>, scheduled_date: Option<String>, done: bool, #[serde(default)] deleted_at: Option<String> }
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Transaction { id: String, amount: f64, category: String, note: String, kind: String, created_at: String, updated_at: Option<String> }
#[derive(Serialize, Deserialize)]
struct AppData { notes: Vec<Note>, transactions: Vec<Transaction> }
#[derive(Deserialize)]
struct AiRequest { prompt: String, context: String }
#[derive(Serialize)]
struct AiReply { content: String, model: String }

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
  let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join("qingjian.db"))
}
fn connection(app: &AppHandle) -> Result<Connection, String> {
  let conn = Connection::open(database_path(app)?).map_err(|e| e.to_string())?;
  conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, content TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT, scheduled_date TEXT, done INTEGER NOT NULL, deleted_at TEXT);
    CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, amount REAL NOT NULL, category TEXT NOT NULL, note TEXT NOT NULL, kind TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT);")
    .map_err(|e| e.to_string())?;
  let has_deleted_at: i64 = conn.query_row("SELECT COUNT(*) FROM pragma_table_info('notes') WHERE name='deleted_at'", [], |r| r.get(0)).map_err(|e| e.to_string())?;
  if has_deleted_at == 0 { conn.execute("ALTER TABLE notes ADD COLUMN deleted_at TEXT", []).map_err(|e| e.to_string())?; }
  Ok(conn)
}

#[tauri::command]
fn load_data(app: AppHandle) -> Result<AppData, String> {
  let conn = connection(&app)?;
  let mut notes_stmt = conn.prepare("SELECT id, content, status, created_at, updated_at, scheduled_date, done, deleted_at FROM notes ORDER BY created_at DESC").map_err(|e| e.to_string())?;
  let notes = notes_stmt.query_map([], |r| Ok(Note { id:r.get(0)?, content:r.get(1)?, status:r.get(2)?, created_at:r.get(3)?, updated_at:r.get(4)?, scheduled_date:r.get(5)?, done:r.get::<_, i64>(6)? != 0, deleted_at:r.get(7)? })).map_err(|e| e.to_string())?.collect::<Result<Vec<_>,_>>().map_err(|e| e.to_string())?;
  let mut tx_stmt = conn.prepare("SELECT id, amount, category, note, kind, created_at, updated_at FROM transactions ORDER BY created_at DESC").map_err(|e| e.to_string())?;
  let transactions = tx_stmt.query_map([], |r| Ok(Transaction { id:r.get(0)?, amount:r.get(1)?, category:r.get(2)?, note:r.get(3)?, kind:r.get(4)?, created_at:r.get(5)?, updated_at:r.get(6)? })).map_err(|e| e.to_string())?.collect::<Result<Vec<_>,_>>().map_err(|e| e.to_string())?;
  Ok(AppData { notes, transactions })
}

#[tauri::command]
fn save_data(app: AppHandle, data: AppData) -> Result<(), String> {
  let mut conn = connection(&app)?;
  let tx = conn.transaction().map_err(|e| e.to_string())?;
  tx.execute("DELETE FROM notes", []).map_err(|e| e.to_string())?;
  tx.execute("DELETE FROM transactions", []).map_err(|e| e.to_string())?;
  for n in data.notes { tx.execute("INSERT INTO notes (id,content,status,created_at,updated_at,scheduled_date,done,deleted_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)", params![n.id,n.content,n.status,n.created_at,n.updated_at,n.scheduled_date,n.done as i64,n.deleted_at]).map_err(|e| e.to_string())?; }
  for t in data.transactions { tx.execute("INSERT INTO transactions VALUES (?1,?2,?3,?4,?5,?6,?7)", params![t.id,t.amount,t.category,t.note,t.kind,t.created_at,t.updated_at]).map_err(|e| e.to_string())?; }
  tx.commit().map_err(|e| e.to_string())
}

fn secret_entry() -> Result<Entry, String> { Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string()) }
#[tauri::command]
fn ai_configured() -> bool { secret_entry().and_then(|e| e.get_password().map_err(|x| x.to_string())).map(|v| !v.is_empty()).unwrap_or(false) }
#[tauri::command]
fn import_deepseek_config() -> Result<bool, String> {
  if ai_configured() { return Ok(true) }
  let home = std::env::var("USERPROFILE").map_err(|_| "未找到用户目录".to_string())?;
  let path = PathBuf::from(home).join(".config").join("opencode").join("opencode.json");
  let raw = fs::read_to_string(path).map_err(|_| "没有找到现有的 DeepSeek 配置".to_string())?;
  let value: serde_json::Value = serde_json::from_str(&raw).map_err(|_| "DeepSeek 配置格式不正确".to_string())?;
  let key = value.pointer("/provider/deepseek/options/apiKey").and_then(|v| v.as_str()).filter(|v| !v.is_empty()).ok_or("现有配置中没有 DeepSeek API 密钥".to_string())?;
  secret_entry()?.set_password(key).map_err(|e| e.to_string())?;
  Ok(true)
}
#[tauri::command]
async fn ask_deepseek(request: AiRequest) -> Result<AiReply, String> {
  let key = secret_entry()?.get_password().map_err(|_| "尚未配置 DeepSeek API 密钥".to_string())?;
  let client = reqwest::Client::new();
  let response = client.post(API_URL).bearer_auth(key).json(&serde_json::json!({
    "model": MODEL,
    "thinking": { "type": "disabled" },
    "temperature": 0.4,
    "max_tokens": 1200,
    "messages": [
      {"role":"system","content":"你是晴笺的私人笔记助手。请使用简洁、温和的中文回答。你只依据用户提供的笔记与账本摘要，不臆造事实。可协助总结、提炼待办、规划明日和分析消费。"},
      {"role":"user","content":format!("用户问题：{}\n\n本地数据摘要：\n{}", request.prompt, request.context)}
    ]
  })).send().await.map_err(|e| format!("无法连接 DeepSeek：{e}"))?;
  if !response.status().is_success() { return Err(format!("DeepSeek 请求失败（{}）", response.status())) }
  let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
  let content = body.pointer("/choices/0/message/content").and_then(|v| v.as_str()).unwrap_or("未获得有效回复").to_string();
  Ok(AiReply { content, model: MODEL.to_string() })
}

pub fn run() {
  // One-time migration from the user's existing local AI-tool configuration.
  // The value is moved to the OS credential vault and never exposed to the webview.
  let _ = import_deepseek_config();
  tauri::Builder::default().plugin(tauri_plugin_opener::init()).invoke_handler(tauri::generate_handler![load_data, save_data, ai_configured, import_deepseek_config, ask_deepseek]).run(tauri::generate_context!()).expect("error while running 晴笺");
}
