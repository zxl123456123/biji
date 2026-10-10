use serde::Serialize;
use std::sync::Mutex;
use tauri::{Emitter, Manager, WebviewWindow};

#[derive(Clone, Copy, Serialize, PartialEq, Debug)]
pub struct Point { pub x:i32, pub y:i32 }
#[derive(Clone, Copy, Serialize)]
pub struct Size { pub width:u32, pub height:u32 }
#[derive(Clone, Copy, Serialize)]
pub struct Area { pub x:i32, pub y:i32, pub width:u32, pub height:u32 }
#[derive(Clone, Serialize)]
#[serde(rename_all="camelCase")]
pub struct Geometry { pub visible:bool,pub position:Point,pub outer_size:Size,pub work_area:Area,pub scale_factor:f64,pub active_drag_id:Option<u64>,pub last_exited_drag_id:Option<u64> }
#[derive(Clone, Copy)]
enum Expected { Movement(u64,Point), Placement(Point) }
#[derive(Default)]
pub struct NativeRuntime {
    counter:u64, movement:Option<u64>, pending_drag:Option<u64>, loop_drag:Option<u64>,last_exited:Option<u64>,expected:Option<Expected>,
}
#[derive(Default)]
pub struct NativeState(pub Mutex<NativeRuntime>);
impl NativeRuntime {
    fn enter(&mut self)->Option<serde_json::Value>{self.movement=None;self.expected=None;self.pending_drag.take().map(|id|{self.loop_drag=Some(id);serde_json::json!({"kind":"drag-enter","dragId":id})})}
    fn exit(&mut self)->Option<serde_json::Value>{self.loop_drag.take().map(|id|{self.last_exited=Some(id);serde_json::json!({"kind":"drag-exit","dragId":id})})}
    fn moved(&mut self,point:Point)->Option<serde_json::Value>{match self.expected {
        Some(Expected::Movement(id,p)) if p==point&&self.movement==Some(id)=>Some(serde_json::json!({"kind":"move-owned","movementId":id,"position":point})),
        Some(Expected::Placement(p)) if p==point=>None,
        _=>{let cancelled=self.movement.take();self.expected=None;Some(serde_json::json!({"kind":"move-external","cancelledMovementId":cancelled,"position":point}))}
    }}
}
fn on_ui<T:Send+'static>(window:&WebviewWindow, work:impl FnOnce(WebviewWindow)->Result<T,String>+Send+'static)->Result<T,String> {
    let (send,receive)=std::sync::mpsc::sync_channel(1);let w=window.clone();
    window.run_on_main_thread(move||{let _=send.send(work(w));}).map_err(|e|e.to_string())?;
    receive.recv().map_err(|_|"伙伴窗口线程不可用".to_string())?
}
pub fn geometry(window:&WebviewWindow)->Result<Geometry,String>{
    let position=window.outer_position().map_err(|e|e.to_string())?;let size=window.outer_size().map_err(|e|e.to_string())?;
    let monitor=window.current_monitor().map_err(|e|e.to_string())?.or(window.primary_monitor().map_err(|e|e.to_string())?).ok_or("未找到可用显示器")?;
    let area=monitor.work_area();let state=window.state::<NativeState>();let native=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
    Ok(Geometry{visible:window.is_visible().map_err(|e|e.to_string())?,position:Point{x:position.x,y:position.y},outer_size:Size{width:size.width,height:size.height},
        work_area:Area{x:area.position.x,y:area.position.y,width:area.size.width,height:area.size.height},scale_factor:monitor.scale_factor(),active_drag_id:native.loop_drag.or(native.pending_drag),last_exited_drag_id:native.last_exited})
}
fn clamp(point:Point,geometry:&Geometry)->Point{
    let a=geometry.work_area;let s=geometry.outer_size;let left=a.x.saturating_add(8);let top=a.y.saturating_add(8);
    Point{x:point.x.clamp(left,left.max(a.x.saturating_add(a.width as i32).saturating_sub(s.width as i32).saturating_sub(8))),y:point.y.clamp(top,top.max(a.y.saturating_add(a.height as i32).saturating_sub(s.height as i32).saturating_sub(8)))}
}
pub fn begin(window:&WebviewWindow)->Result<u64,String>{on_ui(window,|w|{
    if !w.is_visible().map_err(|e|e.to_string())?{return Err("伙伴已收起".into())}
    let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
    if s.pending_drag.is_some()||s.loop_drag.is_some(){return Err("伙伴正在拖动".into())}s.counter+=1;let id=s.counter;s.movement=Some(id);Ok(id)
})}
pub fn cancel(window:&WebviewWindow,id:Option<u64>)->Result<(),String>{on_ui(window,move|w|{
    let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
    if id.is_none()||s.movement==id{s.movement=None;s.expected=None}Ok(())
})}
pub fn step(window:&WebviewWindow,id:u64,x:i32,y:i32)->Result<(),String>{on_ui(window,move|w|{
    {let state=w.state::<crate::desktop_pet::PetState>();let s=state.0.lock().map_err(|_|"伙伴状态不可用")?;
        if !s.current.protocol_ready||!s.current.shown||!s.current.motion_enabled{return Err("伙伴活动已取消".into())}}
    let g=geometry(&w)?;let point=clamp(Point{x,y},&g);
    {let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
        if s.movement!=Some(id)||s.pending_drag.is_some()||s.loop_drag.is_some()||!g.visible{return Err("伙伴活动已取消".into())}
        s.expected=Some(Expected::Movement(id,point));}
    let result=set_position(&w,point);
    {let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;s.expected=None;if result.is_err()&&s.movement==Some(id){s.movement=None;}}
    result
})}
fn placement(window:&WebviewWindow,point:Point)->Result<(),String>{
    {let state=window.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;if s.pending_drag.is_some()||s.loop_drag.is_some(){return Err("伙伴正在拖动".into())}s.expected=Some(Expected::Placement(point));}
    let result=set_position(window,point);
    window.state::<NativeState>().0.lock().map_err(|_|"伙伴运动状态不可用")?.expected=None;result
}
pub fn drag(window:&WebviewWindow)->Result<u64,String>{on_ui(window,|w|{
    let id={let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
        if s.pending_drag.is_some()||s.loop_drag.is_some(){return Err("伙伴正在拖动".into())}s.movement=None;s.expected=None;s.counter+=1;let id=s.counter;s.pending_drag=Some(id);id};
    if let Err(e)=w.start_dragging(){let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;if s.pending_drag==Some(id){s.pending_drag=None}return Err(e.to_string())}Ok(id)
})}
pub fn finish(window:&WebviewWindow,id:u64)->Result<Geometry,String>{on_ui(window,move|w|{
    {let state=w.state::<NativeState>();let s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;
        if s.last_exited!=Some(id)||s.pending_drag.is_some()||s.loop_drag.is_some(){return Err("伙伴仍在拖动".into())}}
    let g=geometry(&w)?;placement(&w,clamp(g.position,&g))?;geometry(&w)
})}

#[cfg(windows)]
use windows_sys::Win32::{Foundation::{HWND, LPARAM,LRESULT,WPARAM,RECT},UI::{Shell::{SetWindowSubclass,RemoveWindowSubclass,DefSubclassProc},WindowsAndMessaging::{WM_MOVE,WM_ENTERSIZEMOVE,WM_EXITSIZEMOVE,WM_NCDESTROY,GetWindowRect,SetWindowPos,SWP_NOACTIVATE,SWP_NOSIZE,SWP_NOZORDER}}};
#[cfg(windows)]
const SUBCLASS_ID:usize=0x514a5045;
#[cfg(windows)]
struct Context { app:tauri::AppHandle }
#[cfg(windows)]
unsafe extern "system" fn callback(hwnd:HWND,message:u32,wparam:WPARAM,lparam:LPARAM,id:usize,data:usize)->LRESULT {
    if message==WM_NCDESTROY {
        RemoveWindowSubclass(hwnd,Some(callback),id);
        if data!=0{drop(Box::from_raw(data as *mut Context));}
        return DefSubclassProc(hwnd,message,wparam,lparam)
    }
    let _=std::panic::catch_unwind(std::panic::AssertUnwindSafe(||{
        if data==0{return}let context=&*(data as *const Context);let state=context.app.state::<NativeState>();
        let event={let Ok(mut s)=state.0.lock() else{return};match message {
            WM_ENTERSIZEMOVE=>s.enter(),
            WM_EXITSIZEMOVE=>s.exit(),
            WM_MOVE=>{
                let mut rect:RECT=std::mem::zeroed();if GetWindowRect(hwnd,&mut rect)==0{s.movement=None;s.expected=None;return}
                s.moved(Point{x:rect.left,y:rect.top})
            },_=>None}};
        if let Some(event)=event{let _=context.app.emit_to("pet","qingjian:pet-native",event);}
    }));
    DefSubclassProc(hwnd,message,wparam,lparam)
}
#[cfg(windows)]
fn set_position(window:&WebviewWindow,point:Point)->Result<(),String>{
    let hwnd=window.hwnd().map_err(|e|e.to_string())?.0 as HWND;
    if unsafe{SetWindowPos(hwnd,std::ptr::null_mut(),point.x,point.y,0,0,SWP_NOACTIVATE|SWP_NOSIZE|SWP_NOZORDER)}==0{Err("伙伴定位失败".into())}else{Ok(())}
}
#[cfg(not(windows))]
fn set_position(window:&WebviewWindow,point:Point)->Result<(),String>{window.set_position(tauri::PhysicalPosition::new(point.x,point.y)).map_err(|e|e.to_string())}
pub fn recall(window:&WebviewWindow)->Result<(),String>{on_ui(window,|w|{
    {let state=w.state::<NativeState>();let mut s=state.0.lock().map_err(|_|"伙伴运动状态不可用")?;s.movement=None;s.expected=None;}
    let g=geometry(&w)?;
    let point=Point{x:g.work_area.x+g.work_area.width as i32-g.outer_size.width as i32-8,y:g.work_area.y+g.work_area.height as i32-g.outer_size.height as i32-8};
    placement(&w,clamp(point,&g))
})}
pub fn install(window:&WebviewWindow)->Result<(),String>{on_ui(window,|w|{
    #[cfg(windows)] {
        let hwnd=w.hwnd().map_err(|e|e.to_string())?.0 as HWND;let raw=Box::into_raw(Box::new(Context{app:w.app_handle().clone()}));
        if unsafe{SetWindowSubclass(hwnd,Some(callback),SUBCLASS_ID,raw as usize)}==0{unsafe{drop(Box::from_raw(raw));}return Err("伙伴原生拖动暂不可用".into())}
    }
    let g=geometry(&w)?;let point=Point{x:g.work_area.x+g.work_area.width as i32-g.outer_size.width as i32-8,y:g.work_area.y+g.work_area.height as i32-g.outer_size.height as i32-8};
    placement(&w,clamp(point,&g))?;
    w.state::<crate::desktop_pet::PetState>().0.lock().map_err(|_|"伙伴状态不可用")?.native_ready=true;Ok(())
})}
#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn negative_monitor_and_small_area(){let g=Geometry{visible:true,position:Point{x:-1800,y:0},outer_size:Size{width:220,height:260},work_area:Area{x:-1920,y:-120,width:1920,height:1080},scale_factor:1.0,active_drag_id:None,last_exited_drag_id:None};assert_eq!(clamp(Point{x:-3000,y:-999},&g),Point{x:-1912,y:-112});assert_eq!(clamp(Point{x:0,y:9999},&g),Point{x:-228,y:692});}
    #[test] fn holding_still_does_not_finish_without_native_exit(){let mut s=NativeRuntime::default();s.pending_drag=Some(1);assert!(s.exit().is_none());s.enter();assert_eq!(s.loop_drag,Some(1));s.moved(Point{x:50,y:50});assert!(s.last_exited.is_none());let event=s.exit().unwrap();assert_eq!(event["dragId"],1);assert_eq!(s.last_exited,Some(1));s.pending_drag=Some(2);assert!(s.exit().is_none());assert_eq!(s.pending_drag,Some(2));}
    #[test] fn fifteen_owned_steps_do_not_cancel_and_external_move_does(){let mut s=NativeRuntime::default();s.movement=Some(7);for x in -80000..-79985{let point=Point{x,y:-100};s.expected=Some(Expected::Movement(7,point));assert_eq!(s.moved(point).unwrap()["kind"],"move-owned");assert_eq!(s.movement,Some(7));}let external=s.moved(Point{x:-79980,y:-100}).unwrap();assert_eq!(external["cancelledMovementId"],7);assert_eq!(s.movement,None);}
    #[test] fn placement_has_no_movement_and_old_owned_id_is_not_current(){let mut s=NativeRuntime::default();let point=Point{x:42,y:-20};s.expected=Some(Expected::Placement(point));assert!(s.moved(point).is_none());s.movement=Some(9);s.expected=Some(Expected::Movement(8,point));assert_eq!(s.moved(point).unwrap()["kind"],"move-external");assert_eq!(s.movement,None);}
}
