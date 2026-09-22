use axum::{
    extract::{
        State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::Response,
};
use futures_util::StreamExt;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    config::AppState,
    handlers::control::execute_control,
    models::auth::{ClientMessage, ServerMessage},
};

pub async fn websocket(ws: WebSocketUpgrade, State(state): State<Arc<AppState>>) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    println!("WebSocket connection opened");

    let Some(Ok(Message::Text(message))) = socket.next().await else {
        println!("WebSocket connection closed before authentication");
        return;
    };

    let Ok(ClientMessage::Auth { device_name, token }) = serde_json::from_str(&message) else {
        println!("WebSocket authentication failed: invalid first message");
        let _ = send_message(
            &mut socket,
            ServerMessage::Error {
                message: "The first websocket message must authenticate this device.".into(),
            },
        )
        .await;
        return;
    };

    if let Some(token) = token {
        let valid = state.tokens.read().await.contains(&token);
        if !valid {
            println!("WebSocket authentication denied: invalid token");
            let _ = send_message(
                &mut socket,
                ServerMessage::AuthDenied {
                    reason: "This access token is no longer valid.".into(),
                },
            )
            .await;
            return;
        }

        println!("User authenticated with an existing token");
    } else {
        let _ = send_message(&mut socket, ServerMessage::AuthPending).await;
        let device_name = device_name.unwrap_or_else(|| "Web Remote".into());
        println!("User authentication requested for device '{}'", device_name);
        let approval_device_name = device_name.clone();
        let approved =
            tokio::task::spawn_blocking(move || prompt_for_approval(&approval_device_name))
                .await
                .unwrap_or(false);

        if !approved {
            println!("User authentication denied for device '{}'", device_name);
            let _ = send_message(
                &mut socket,
                ServerMessage::AuthDenied {
                    reason: "Pairing denied by host computer.".into(),
                },
            )
            .await;
            return;
        }

        let token = Uuid::new_v4().to_string();
        state.tokens.write().await.insert(token.clone());
        println!("User authenticated and paired for device '{}'", device_name);

        if send_message(&mut socket, ServerMessage::AuthApproved { token })
            .await
            .is_err()
        {
            return;
        }
    }

    if send_message(&mut socket, ServerMessage::Ready)
        .await
        .is_err()
    {
        return;
    }

    while let Some(Ok(message)) = socket.next().await {
        let Message::Text(message) = message else {
            continue;
        };

        match serde_json::from_str(&message) {
            Ok(ClientMessage::Command { action }) => {
                let action_name = action.name().to_string();
                println!("Executing command {}", action_name);
                match execute_control(action).await {
                    Ok(()) => {
                        println!("Command executed successfully: {}", action_name);
                        if send_message(
                            &mut socket,
                            ServerMessage::CommandAck {
                                action: action_name,
                            },
                        )
                        .await
                        .is_err()
                        {
                            break;
                        }
                    }
                    Err((_, message)) => {
                        println!("Command execution failed for {}: {}", action_name, message);
                        if send_message(&mut socket, ServerMessage::Error { message })
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                }
            }
            Ok(ClientMessage::Auth { .. }) => {
                if send_message(
                    &mut socket,
                    ServerMessage::Error {
                        message: "This websocket is already authenticated.".into(),
                    },
                )
                .await
                .is_err()
                {
                    break;
                }
            }
            Err(_) => {
                if send_message(
                    &mut socket,
                    ServerMessage::Error {
                        message: "Invalid websocket message.".into(),
                    },
                )
                .await
                .is_err()
                {
                    break;
                }
            }
        }
    }
}

async fn send_message(socket: &mut WebSocket, message: ServerMessage) -> Result<(), axum::Error> {
    let payload = serde_json::to_string(&message).map_err(axum::Error::new)?;
    socket.send(Message::Text(payload.into())).await
}

fn prompt_for_approval(device_name: &str) -> bool {
    println!("Waiting for pairing approval for device '{}'", device_name);
    println!("\n=========================================");
    println!("AUTH REQUEST FROM DEVICE: '{}'", device_name);
    print!("Allow control access on this computer? (y/N): ");
    use std::io::Write;
    let _ = std::io::stdout().flush();

    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap_or(0);
    input.trim().eq_ignore_ascii_case("y")
}
