use axum::{Json, http::StatusCode};
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

use crate::{middleware::auth::Authenticated, models::control::ControlCommand};

pub async fn handle_control(
    _auth: Authenticated,
    Json(cmd): Json<ControlCommand>,
) -> Result<StatusCode, (StatusCode, String)> {
    // OS interactions (simulating keys) should run in spawn_blocking
    // so they don't block the Tokio async runtime.
    tokio::task::spawn_blocking(move || {
        // Initialize Enigo inside the task
        let mut enigo = Enigo::new(&Settings::default()).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to init Enigo: {}", e),
            )
        })?;

        // Map the API request to the corresponding Enigo Key
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

        // Simulate the physical click
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

    Ok(StatusCode::OK)
}
