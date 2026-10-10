use tauri::{menu::{Menu, MenuItem}, tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent}, AppHandle, Manager};

pub fn open_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open-main", "打开晴笺", true, None::<&str>)?;
    let show = MenuItem::with_id(app, "show-pet", "召唤伙伴", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide-pet", "收起伙伴", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出晴笺", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &show, &hide, &quit])?;
    let icon = app.default_window_icon().expect("application icon is configured").clone();
    TrayIconBuilder::with_id("qingjian-tray")
        .icon(icon).tooltip("晴笺 · 正在运行").menu(&menu).show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if matches!(event, TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. }) {
                open_main(tray.app_handle());
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open-main" => open_main(app),
            "show-pet" => {
                if crate::desktop_pet::tray_action(app, crate::desktop_pet::Intent::Show).is_err() { open_main(app); }
            }
            "hide-pet" => {
                if crate::desktop_pet::tray_action(app, crate::desktop_pet::Intent::Hide).is_err() { open_main(app); }
            }
            "quit" => { crate::native_bootstrap::window_closed(app); app.exit(0); }
            _ => {}
        }).build(app)?;
    Ok(())
}
