use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow, WebviewWindowBuilder, WebviewUrl};
use crate::desktop_pet_windows;

pub const SNAPSHOT: &str = "qingjian:pet-snapshot";
pub const ACTION: &str = "qingjian:pet-action";
pub const RESULT: &str = "qingjian:pet-result";
pub const VISIBILITY: &str = "qingjian:pet-visibility";
pub fn require_label(label: &str, expected: &str) -> Result<(), String> {
    if label == expected { Ok(()) } else { Err("此窗口无权执行该操作".into()) }
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Appearance { pub character: String, pub palette: String, pub head: String, pub accessory: String }
impl Default for Appearance {
    fn default() -> Self { Self { character:"xiaotuan".into(), palette:"cloud".into(), head:"none".into(), accessory:"none".into() } }
}
#[derive(Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct Reminder { pub day: String, pub token: String }
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub owner: u64, pub revision: u64, pub protocol_ready: bool, pub appearance: Appearance,
    pub theme: String, pub shown: bool, pub motion_enabled: bool, pub local_day: String,
    pub due_count: u32, pub due_titles: Vec<String>, pub reminder: Option<Reminder>,
}
impl Default for Snapshot {
    fn default() -> Self { Self { owner:0,revision:0,protocol_ready:false,appearance:Appearance::default(),theme:"light".into(),shown:false,motion_enabled:false,local_day:String::new(),due_count:0,due_titles:vec![],reminder:None } }
}
#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Publish {
    pub owner:u64, pub appearance:Appearance, pub theme:String, pub shown:bool, pub motion_enabled:bool,
    pub local_day:String, pub due_count:u32, pub due_titles:Vec<String>, pub reminder_eligible:bool,
}
#[derive(Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all="kebab-case")]
pub enum Intent { QuickNote, OpenTodos, Show, Hide, ReminderShown }
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all="camelCase", deny_unknown_fields)]
pub struct Action { pub owner:u64, pub request_id:String, pub intent:Intent, pub reminder:Option<Reminder> }
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all="camelCase", deny_unknown_fields)]
pub struct ActionResult { pub owner:u64, pub request_id:String, pub status:String, pub reason:Option<String> }
#[derive(Default)]
pub struct Runtime {
    pub current:Snapshot, pub active_owner:bool, pub native_ready:bool,
    reminder_day:String, token_counter:u64, reminder_token:String,
    recent:Option<(Action, Option<ActionResult>)>, confirmation:Option<(Action, Option<ActionResult>)>,
}
#[derive(Default)]
pub struct PetState(pub Mutex<Runtime>);
impl Runtime {
    fn begin_owner(&mut self)->Snapshot {
        self.current.owner+=1;self.current.revision+=1;self.current.protocol_ready=false;self.current.reminder=None;
        self.active_owner=true;self.recent=None;self.confirmation=None;self.current.clone()
    }
    fn end_owner(&mut self,owner:u64)->Option<Snapshot>{
        if self.current.owner!=owner||!self.active_owner{return None}
        self.active_owner=false;self.current.protocol_ready=false;self.current.reminder=None;self.current.revision+=1;Some(self.current.clone())
    }
    fn publish(&mut self,publish:Publish)->Result<Snapshot,String>{
        validate(&publish)?;
        if !self.active_owner||self.current.owner!=publish.owner{return Err("伙伴所有者已过期".into())}
        if !self.native_ready{return Err("桌面伙伴暂不可用".into())}
        if self.reminder_day!=publish.local_day {self.reminder_day=publish.local_day.clone();self.token_counter+=1;self.reminder_token=format!("{}:{}",self.reminder_day,self.token_counter);}
        let reminder=if publish.reminder_eligible&&publish.shown&&publish.due_count>0 {Some(Reminder{day:self.reminder_day.clone(),token:self.reminder_token.clone()})}else{None};
        self.current=Snapshot{owner:publish.owner,revision:self.current.revision+1,protocol_ready:true,appearance:publish.appearance,theme:publish.theme,shown:publish.shown,motion_enabled:publish.motion_enabled,local_day:publish.local_day,due_count:publish.due_count,due_titles:publish.due_titles,reminder};Ok(self.current.clone())
    }
}
fn valid_day(day:&str)->bool {
    let b=day.as_bytes(); b.len()==10 && b[4]==b'-' && b[7]==b'-' && b.iter().enumerate().all(|(i,v)|i==4||i==7||v.is_ascii_digit())
        && (1..=12).contains(&day[5..7].parse::<u8>().unwrap_or(0)) && (1..=31).contains(&day[8..10].parse::<u8>().unwrap_or(0))
}
fn validate(p:&Publish)->Result<(),String> {
    let a=&p.appearance;
    if !["xiaotuan","nailong","chiikawa","hachiware","usagi"].contains(&a.character.as_str())
        || !["cloud","mint","peach"].contains(&a.palette.as_str()) || !["none","beret","halo"].contains(&a.head.as_str())
        || !["none","scarf","bow"].contains(&a.accessory.as_str()) || !["light","dark"].contains(&p.theme.as_str())
        || !valid_day(&p.local_day) || p.due_titles.len()>5 || p.due_titles.iter().any(|s|s.chars().count()>160)
        || p.due_titles.len()>p.due_count as usize { return Err("伙伴摘要格式不正确".into()) } Ok(())
}
fn pet(app:&AppHandle)->Result<WebviewWindow,String> { app.get_webview_window("pet").ok_or_else(||"桌面伙伴暂不可用".into()) }
fn emit_snapshot(app:&AppHandle,snapshot:&Snapshot)->Result<(),String> { app.emit_to("pet",SNAPSHOT,snapshot).map_err(|e|e.to_string()) }
fn visible(app:&AppHandle, show:bool)->Result<(),String> {
    let w=pet(app)?; if show { w.show() } else { w.hide() }.map_err(|e|e.to_string())?;
    app.emit_to("pet", VISIBILITY, serde_json::json!({"visible":show})).map_err(|e|e.to_string())
}
pub fn setup(app:&AppHandle)->Result<(),String> {
    let window=WebviewWindowBuilder::new(app,"pet",WebviewUrl::External(tauri::Url::parse("about:blank").map_err(|e|e.to_string())?))
        .title("晴笺桌面伙伴").inner_size(220.,260.).transparent(true).decorations(false).shadow(false)
        .resizable(false).always_on_top(true).skip_taskbar(true).visible(false).focused(false).build().map_err(|e|e.to_string())?;
    desktop_pet_windows::install(&window)?;
    Ok(())
}
pub fn close_pet(app:&AppHandle) {
    let state=app.state::<PetState>();
    let action=state.0.lock().ok().and_then(|mut s|{
        if !s.active_owner||!s.current.protocol_ready{return None}
        let action=Action{owner:s.current.owner,request_id:format!("native-close:{}:{}",s.current.owner,s.current.revision),intent:Intent::Hide,reminder:None};
        s.recent=Some((action.clone(),None));Some(action)
    });
    if let Some(action)=action {if app.emit_to("main",ACTION,action).is_ok(){return}}
    let _=visible(app,false);eprintln!("伙伴收起未获主窗确认，未修改偏好");
}
pub fn tray_action(app: &AppHandle, intent: Intent) -> Result<(), String> {
    crate::native_bootstrap::require_ready(app)?;
    let action = {
        let state = app.state::<PetState>();
        let mut s = state.0.lock().map_err(|_| "伙伴状态不可用")?;
        if !s.active_owner || !s.current.protocol_ready { return Err("桌面伙伴尚未就绪".into()); }
        let action = Action { owner: s.current.owner, request_id: format!("tray:{}:{}:{:?}", s.current.owner, s.current.revision, std::time::SystemTime::now()), intent, reminder: None };
        s.recent = Some((action.clone(), None));
        action
    };
    app.emit_to("main", ACTION, action).map_err(|e| e.to_string())
}
#[tauri::command]
pub fn pet_recall(window: WebviewWindow, app: AppHandle) -> Result<(), String> {
    require_label(window.label(), "main")?;
    crate::native_bootstrap::require_ready(&app)?;
    desktop_pet_windows::recall(&pet(&app)?)
}
#[tauri::command]
pub fn pet_begin_owner(window:WebviewWindow,app:AppHandle,state:State<PetState>)->Result<Snapshot,String> {
    require_label(window.label(),"main")?;
    crate::native_bootstrap::require_ready(&app)?;
    desktop_pet_windows::cancel(&pet(&app)?,None)?;
    let current=state.0.lock().map_err(|_|"伙伴状态不可用")?.begin_owner();
    visible(&app,false)?;emit_snapshot(&app,&current)?;Ok(current)
}
#[tauri::command]
pub fn pet_end_owner(window:WebviewWindow,app:AppHandle,state:State<PetState>,owner:u64)->Result<(),String> {
    require_label(window.label(),"main")?;
    crate::native_bootstrap::require_ready(&app)?;
    let Some(current)=state.0.lock().map_err(|_|"伙伴状态不可用")?.end_owner(owner) else{return Ok(())};
    desktop_pet_windows::cancel(&pet(&app)?,None)?;visible(&app,false)?;emit_snapshot(&app,&current)
}
#[tauri::command]
pub fn pet_publish(window:WebviewWindow,app:AppHandle,state:State<PetState>,publish:Publish)->Result<Snapshot,String> {
    require_label(window.label(),"main")?;
    crate::native_bootstrap::require_ready(&app)?;
    validate(&publish)?;
    let current=state.0.lock().map_err(|_|"伙伴状态不可用")?.publish(publish)?;
    if !current.shown||!current.motion_enabled{desktop_pet_windows::cancel(&pet(&app)?,None)?;}
    if let Err(e)=visible(&app,current.shown) {
        let fallback={let mut s=state.0.lock().map_err(|_|"伙伴状态不可用")?;s.current.protocol_ready=false;s.current.revision+=1;s.current.clone()};
        let _=visible(&app,false);let _=emit_snapshot(&app,&fallback);return Err(e)
    }
    emit_snapshot(&app,&current)?;Ok(current)
}
#[tauri::command]
pub fn pet_read(window:WebviewWindow,app:AppHandle,state:State<PetState>)->Result<serde_json::Value,String> {
    require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;
    let snapshot=state.0.lock().map_err(|_|"伙伴状态不可用")?.current.clone();
    Ok(serde_json::json!({"snapshot":snapshot,"visible":window.is_visible().map_err(|e|e.to_string())?}))
}
#[tauri::command]
pub fn pet_action(window:WebviewWindow,app:AppHandle,state:State<PetState>,action:Action)->Result<(),String> {
    require_label(window.label(),"pet")?;
    crate::native_bootstrap::require_ready(&app)?;
    if action.request_id.is_empty()||action.request_id.len()>100{return Err("伙伴请求格式不正确".into())}
    let cached={let mut s=state.0.lock().map_err(|_|"伙伴状态不可用")?;
        if !s.active_owner||!s.current.protocol_ready||s.current.owner!=action.owner{return Err("桌面伙伴暂不可用".into())}
        if action.intent==Intent::ReminderShown && (action.reminder.is_none()||action.reminder!=s.current.reminder){return Err("提醒已过期".into())}
        let slot=if action.intent==Intent::ReminderShown{&mut s.confirmation}else{&mut s.recent};
        if let Some((previous,result))=slot {if previous.request_id==action.request_id {Some(result.clone())}else{*slot=Some((action.clone(),None));None}}
        else{*slot=Some((action.clone(),None));None}};
    if let Some(result)=cached {if let Some(r)=result {app.emit_to("pet",RESULT,r).map_err(|e|e.to_string())?;}return Ok(())}
    if action.intent==Intent::QuickNote||action.intent==Intent::OpenTodos {
        let main=app.get_webview_window("main").ok_or("晴笺窗口不可用")?;
        main.show().map_err(|e|e.to_string())?;main.unminimize().map_err(|e|e.to_string())?;main.set_focus().map_err(|e|e.to_string())?;
    }
    app.emit_to("main",ACTION,action).map_err(|e|e.to_string())
}
#[tauri::command]
pub fn pet_action_result(window:WebviewWindow,app:AppHandle,state:State<PetState>,result:ActionResult)->Result<(),String> {
    require_label(window.label(),"main")?;
    crate::native_bootstrap::require_ready(&app)?;
    if !["handled","blocked","unavailable"].contains(&result.status.as_str())||result.reason.as_ref().is_some_and(|v|v.chars().count()>200){return Err("伙伴结果格式不正确".into())}
    {let mut s=state.0.lock().map_err(|_|"伙伴状态不可用")?;if !s.active_owner||result.owner!=s.current.owner{return Err("伙伴所有者已过期".into())}
        let target=if s.recent.as_ref().is_some_and(|(a,_)|a.request_id==result.request_id){&mut s.recent}else{&mut s.confirmation};
        match target {Some((action,cached)) if action.request_id==result.request_id=>{*cached=Some(result.clone());},_=>return Err("伙伴请求已过期".into())}}
    app.emit_to("pet",RESULT,result).map_err(|e|e.to_string())
}
#[tauri::command]
pub fn pet_geometry(window:WebviewWindow,app:AppHandle)->Result<desktop_pet_windows::Geometry,String>{require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;desktop_pet_windows::geometry(&window)}
#[tauri::command]
pub fn pet_move_begin(window:WebviewWindow,app:AppHandle,state:State<PetState>)->Result<serde_json::Value,String>{
    require_label(window.label(),"pet")?;
    crate::native_bootstrap::require_ready(&app)?;
    {let s=state.0.lock().map_err(|_|"伙伴状态不可用")?;if !s.current.protocol_ready||!s.current.shown||!s.current.motion_enabled{return Err("伙伴当前不能活动".into())}}
    let id=desktop_pet_windows::begin(&window)?;Ok(serde_json::json!({"movementId":id,"geometry":desktop_pet_windows::geometry(&window)?}))
}
#[tauri::command]
pub fn pet_move_step(window:WebviewWindow,app:AppHandle,movement_id:u64,x:i32,y:i32)->Result<(),String>{require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;desktop_pet_windows::step(&window,movement_id,x,y)}
#[tauri::command]
pub fn pet_move_cancel(window:WebviewWindow,app:AppHandle,movement_id:Option<u64>)->Result<(),String>{require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;desktop_pet_windows::cancel(&window,movement_id)}
#[tauri::command]
pub fn pet_drag(window:WebviewWindow,app:AppHandle)->Result<u64,String>{require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;desktop_pet_windows::drag(&window)}
#[tauri::command]
pub fn pet_drag_finish(window:WebviewWindow,app:AppHandle,drag_id:u64)->Result<desktop_pet_windows::Geometry,String>{require_label(window.label(),"pet")?;crate::native_bootstrap::require_ready(&app)?;desktop_pet_windows::finish(&window,drag_id)}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn caller_is_fixed(){assert!(require_label("pet","main").is_err());assert!(require_label("main","pet").is_err());assert!(require_label("other","main").is_err());assert!(require_label("main","main").is_ok());}
    #[test] fn date_is_bounded(){assert!(valid_day("2026-10-07"));assert!(!valid_day("2026-00-07"));assert!(!valid_day("today"));assert!(!valid_day("2026-10-99"));}
    fn payload(owner:u64)->Publish{Publish{owner,appearance:Appearance::default(),theme:"light".into(),shown:true,motion_enabled:true,local_day:"2026-10-07".into(),due_count:1,due_titles:vec!["test".into()],reminder_eligible:true}}
    #[test] fn old_owner_cannot_publish_or_end_new_owner(){let mut s=Runtime::default();s.native_ready=true;let first=s.begin_owner();let second=s.begin_owner();let current=s.publish(payload(second.owner)).unwrap();assert!(s.publish(payload(first.owner)).is_err());assert!(s.end_owner(first.owner).is_none());assert_eq!(s.current.revision,current.revision);assert!(s.current.protocol_ready);}
    #[test] fn reminder_token_survives_reload_but_changes_on_local_day(){let mut s=Runtime::default();s.native_ready=true;let first=s.begin_owner();let shown=s.publish(payload(first.owner)).unwrap();s.end_owner(first.owner);let second=s.begin_owner();let reloaded=s.publish(payload(second.owner)).unwrap();assert!(shown.reminder==reloaded.reminder);let mut next=payload(second.owner);next.local_day="2026-10-08".into();assert!(s.publish(next).unwrap().reminder!=shown.reminder);}
    #[test] fn hidden_or_no_due_summary_has_no_reminder_and_invalid_payload_does_not_mutate(){let mut s=Runtime::default();s.native_ready=true;let owner=s.begin_owner().owner;let mut hidden=payload(owner);hidden.shown=false;assert!(s.publish(hidden).unwrap().reminder.is_none());let mut empty=payload(owner);empty.due_count=0;empty.due_titles.clear();assert!(s.publish(empty).unwrap().reminder.is_none());let revision=s.current.revision;let mut invalid=payload(owner);invalid.due_titles=vec!["long".repeat(50)];assert!(s.publish(invalid).is_err());assert_eq!(s.current.revision,revision);}
}
