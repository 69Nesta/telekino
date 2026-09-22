use axum::{Json, extract::State, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    config::AppState,
    models::auth::{AuthRequest, AuthResponse},
};

pub async fn request_auth(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, &'static str)> {
    let device_name = payload.device_name;

    // Block async thread while waiting for user interaction on the host CLI
    let approved = tokio::task::spawn_blocking(move || {
        println!("\n=========================================");
        println!("🔒 AUTH REQUEST FROM DEVICE: '{}'", device_name);
        print!("Allow control access on this computer? (y/N): ");
        use std::io::Write;
        std::io::stdout().flush().unwrap();

        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap_or(0);
        input.trim().eq_ignore_ascii_case("y")
    })
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Prompt failed"))?;

    if approved {
        let token = Uuid::new_v4().to_string();
        state.tokens.write().await.insert(token.clone());
        println!("✅ Approved! Access token issued.\n");
        Ok(Json(AuthResponse { token }))
    } else {
        println!("❌ Access Denied.\n");
        Err((StatusCode::FORBIDDEN, "Pairing denied by host computer"))
    }
}
