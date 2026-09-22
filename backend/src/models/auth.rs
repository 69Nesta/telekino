use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct AuthRequest {
    pub device_name: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
}
