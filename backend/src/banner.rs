use crate::config::ServerConfig;
use colored::*;

pub fn print_banner(config: &ServerConfig, network_url: &str) {
    println!(
        "\n  {} {} {}",
        "TELEKINO BACKEND".bold().green(),
        "v0.1.0".green(),
        "(Ctrl+C to exit)\n".white()
    );
    println!(
        "{}{}{}",
        "  ➜ ".green(),
        "Local:     ".bold(),
        colorise_url("http://localhost:", &config.port.to_string(), "/")
    );
    println!(
        "{}{}{}",
        "  ➜ ".green(),
        "Network:   ".bold(),
        colorise_url(
            &format!("http://{network_url}:"),
            &config.port.to_string(),
            "/"
        )
    );
    println!(
        "{}{}{}",
        "  ➜ ".green(),
        "WebSocket: ".bold(),
        colorise_url(
            &format!("ws://{network_url}:"),
            &config.port.to_string(),
            "/ws\n"
        )
    );
}

fn colorise_url(url: &str, port: &str, suffix: &str) -> String {
    format!(
        "{}{}{}",
        url.underline().cyan(),
        port.underline().cyan().bold(),
        suffix.underline().cyan()
    )
}
