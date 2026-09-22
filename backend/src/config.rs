use std::collections::HashSet;
use tokio::sync::RwLock;

// --- Shared Application State ---
#[derive(Default)]
pub struct AppState {
    pub tokens: RwLock<HashSet<String>>,
}
