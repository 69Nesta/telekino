use axum::{Router, http::Method};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use crate::{config::AppState, handlers};
use std::sync::Arc;

pub fn create_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET])
        .allow_headers(Any);

    let app = Router::new()
        .route("/ws", axum::routing::get(handlers::websocket::websocket))
        .with_state(state)
        .layer(cors)
        .fallback_service(ServeDir::new("../frontend/dist"));

    app
}
