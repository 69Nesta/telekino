use axum::{Router, http::Method, routing::post};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use crate::{config::AppState, handlers};
use std::sync::Arc;

pub fn create_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/auth/request", post(handlers::auth::request_auth))
        .route("/api/control", post(handlers::control::handle_control))
        .route("/ws", axum::routing::get(handlers::websocket::websocket))
        .with_state(state)
        .layer(cors)
        .fallback_service(ServeDir::new("../frontend/dist"));

    app
}
