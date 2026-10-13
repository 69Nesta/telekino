use crate::models::background::Rgb;
use std::collections::HashSet;
use tokio::sync::RwLock;
use tokio::sync::watch;

pub struct AppState {
    pub tokens: RwLock<HashSet<String>>,
    pub average_color: watch::Sender<Rgb>,
}

impl Default for AppState {
    fn default() -> Self {
        let (average_color, _) = watch::channel(Rgb::default());
        Self {
            tokens: RwLock::new(HashSet::new()),
            average_color,
        }
    }
}

const DEFAULT_HOST: &str = "0.0.0.0";
const DEFAULT_PORT: u16 = 4242;

#[derive(Clone, Debug)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: DEFAULT_HOST.to_string(),
            port: DEFAULT_PORT,
        }
    }
}

impl ServerConfig {
    pub fn from_env() -> Self {
        let host = std::env::var("TELEKINO_HOST").unwrap_or_else(|_| DEFAULT_HOST.to_string());
        let port = std::env::var("TELEKINO_PORT")
            .ok()
            .and_then(|value| value.parse().ok())
            .unwrap_or(DEFAULT_PORT);

        Self { host, port }
    }
}
