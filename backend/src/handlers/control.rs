use axum::http::StatusCode;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

use crate::models::control::ControlCommand;

pub async fn execute_control(cmd: ControlCommand) -> Result<(), (StatusCode, String)> {
    tokio::task::spawn_blocking(move || {
        let mut enigo = Enigo::new(&Settings::default()).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to init Enigo: {}", e),
            )
        })?;

        let key = match cmd {
            ControlCommand::PlayPause => Key::MediaPlayPause,
            ControlCommand::NextTrack => Key::MediaNextTrack,
            ControlCommand::PreviousTrack => Key::MediaPrevTrack,
            ControlCommand::VolumeUp => Key::VolumeUp,
            ControlCommand::VolumeDown => Key::VolumeDown,
            ControlCommand::VolumeMute => Key::VolumeMute,
            ControlCommand::LeftArrow => Key::LeftArrow,
            ControlCommand::RightArrow => Key::RightArrow,
        };

        enigo.key(key, Direction::Click).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to press key: {}", e),
            )
        })?;

        Ok::<(), (StatusCode, String)>(())
    })
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Thread error".to_string(),
        )
    })??;

    Ok(())
}
