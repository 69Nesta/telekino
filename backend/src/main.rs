mod banner;
mod config;
mod handlers;
mod models;
mod routes;
mod utils;

use axum::serve;
use colored::*;
use config::{AppState, ServerConfig};
use routes::create_router;
use std::sync::Arc;
use tokio::signal;

#[tokio::main]
async fn main() {
    let config = ServerConfig::from_env();
    let state = Arc::new(AppState::default());
    let app = create_router(state);
    let bind_address = format!("{}:{}", config.host, config.port);

    let listener = tokio::net::TcpListener::bind(&bind_address)
        .await
        .unwrap_or_else(|error| panic!("Failed to bind server to {bind_address}: {error}"));

    let network_url = utils::local_network_url();
    banner::print_banner(&config, &network_url);

    let server = serve(listener, app).with_graceful_shutdown(shutdown_signal());

    match server.await {
        Ok(()) => {}
        Err(error) => {
            eprintln!("{} {}", "Server error:".red().bold(), error);
            std::process::exit(1);
        }
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        let mut sigterm = signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler");
        sigterm.recv().await;
    };

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
