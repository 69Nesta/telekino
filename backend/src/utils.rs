use std::net::UdpSocket;

pub fn local_network_url() -> String {
    let Ok(socket) = UdpSocket::bind("0.0.0.0:0") else {
        return "unavailable".to_string();
    };

    if socket.connect("8.8.8.8:80").is_err() {
        return "unavailable".to_string();
    }

    socket
        .local_addr()
        .map(|address| address.ip().to_string())
        .unwrap_or_else(|_| "unavailable".to_string())
}
