mod config;
mod handlers;
mod middleware;
mod models;
mod routes;

use config::AppState;
use routes::create_router;
use std::sync::Arc;

// --- Main Server Setup ---
#[tokio::main]
async fn main() {
    let state = Arc::new(AppState::default());

    let app = create_router(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:6767").await.unwrap();
    println!("🚀 Server listening on http://localhost:6767");

    axum::serve(listener, app).await.unwrap();
}
