use axum::http::StatusCode;
use enigo::{Axis, Button, Coordinate, Direction, Enigo, Key, Keyboard, Mouse, Settings};
use std::collections::HashMap;

use crate::models::control::ControlCommand;

pub async fn execute_control(
    cmd: ControlCommand,
    args: HashMap<String, f32>,
) -> Result<(), (StatusCode, String)> {
    if let ControlCommand::OpenUrl { url } = cmd {
        return open_in_browser(&url);
    }

    tokio::task::spawn_blocking(move || {
        let mut enigo = Enigo::new(&Settings::default()).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to init Enigo: {}", e),
            )
        })?;

        match cmd {
            ControlCommand::Trackpad => {
                if let (Some(&x), Some(&y)) =
                    (args.get("x"), args.get("y"))
                {
                    enigo
                        .move_mouse(x as i32, y as i32, Coordinate::Rel)
                        .map_err(|e| {
                            (
                                StatusCode::INTERNAL_SERVER_ERROR,
                                format!("Failed to move mouse: {}", e),
                            )
                        })?;
                }
            }

            ControlCommand::Click => {
                enigo.button(Button::Left, Direction::Click).map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to click mouse: {}", e),
                    )
                })?;
            }

            ControlCommand::RightClick => {
                enigo.button(Button::Right, Direction::Click).map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to click mouse: {}", e),
                    )
                })?;
            }

            ControlCommand::Scroll => {
                for (key, axis) in [("y", Axis::Vertical), ("x", Axis::Horizontal)] {
                    let delta = args.get(key).copied().unwrap_or(0.0).clamp(-20.0, 20.0);
                    let ticks = delta.round() as i32;
                    if ticks != 0 {
                        enigo.scroll(ticks, axis).map_err(|e| {
                            (
                                StatusCode::INTERNAL_SERVER_ERROR,
                                format!("Failed to scroll: {}", e),
                            )
                        })?;
                    }
                }
            }

            ControlCommand::PlayPause
            | ControlCommand::NextTrack
            | ControlCommand::PreviousTrack
            | ControlCommand::VolumeUp
            | ControlCommand::VolumeDown
            | ControlCommand::VolumeMute
            | ControlCommand::LeftArrow
            | ControlCommand::RightArrow => {
                let key = match cmd {
                    ControlCommand::PlayPause => Key::MediaPlayPause,
                    ControlCommand::NextTrack => Key::MediaNextTrack,
                    ControlCommand::PreviousTrack => Key::MediaPrevTrack,
                    ControlCommand::VolumeUp => Key::VolumeUp,
                    ControlCommand::VolumeDown => Key::VolumeDown,
                    ControlCommand::VolumeMute => Key::VolumeMute,
                    ControlCommand::LeftArrow => Key::LeftArrow,
                    ControlCommand::RightArrow => Key::RightArrow,
                    ControlCommand::Trackpad => unreachable!(),
                    ControlCommand::Click
                    | ControlCommand::RightClick
                    | ControlCommand::Scroll
                    | ControlCommand::OpenUrl { .. } => unreachable!(),
                };

                enigo.key(key, Direction::Click).map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to press key: {}", e),
                    )
                })?;
            }
            ControlCommand::OpenUrl { .. } => unreachable!(),
        }

        Ok::<(), (StatusCode, String)>(())
    })
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Thread error: {}", e),
        )
    })??;

    Ok(())
}

fn open_in_browser(url: &str) -> Result<(), (StatusCode, String)> {
    let target = url.trim();
    if target.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "URL cannot be empty".to_string()));
    }

    let formatted = if target.starts_with("http://") || target.starts_with("https://") {
        target.to_string()
    } else {
        format!("https://{}", target)
    };

    #[cfg(target_os = "macos")]
    let status = std::process::Command::new("open")
        .arg(&formatted)
        .status();

    #[cfg(target_os = "windows")]
    let status = std::process::Command::new("cmd")
        .args(["/C", "start", &formatted])
        .status();

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let status = std::process::Command::new("xdg-open")
        .arg(&formatted)
        .status();

    match status {
        Ok(exit) if exit.success() => Ok(()),
        Ok(exit) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Browser command exited with status: {:?}", exit.code()),
        )),
        Err(err) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to launch browser: {}", err),
        )),
    }
}
