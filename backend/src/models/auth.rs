use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientMessage {
    Auth {
        device_name: Option<String>,
        token: Option<String>,
    },
    Command {
        action: crate::models::control::ControlCommand,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    AuthPending,
    AuthApproved { token: String },
    AuthDenied { reason: String },
    Ready,
    CommandAck { action: String },
    Error { message: String },
}
