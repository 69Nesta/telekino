# Telekino

Telekino is a small remote-control app for a Mac that lets you pair a browser-based controller with a desktop host and send mouse/keyboard actions over a local WebSocket connection.

The project is split into:

- backend: Rust + Axum server that exposes the WebSocket endpoint and serves the built frontend assets
- frontend: React + Vite app that provides the pairing and remote-control UI

## Features

- pair a remote device with a host machine
- authenticate devices with a token-based flow
- control the host over a WebSocket connection
- persist saved devices in the browser
- serve the frontend through the Rust backend in production

## Tech stack

- Backend: Rust, Axum, Tokio, Tower HTTP
- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS

## Prerequisites

Before running the app, install:

- Rust and Cargo: https://rustup.rs/
- Node.js 18+ and npm: https://nodejs.org/

## Installation

From the project root:

```bash
cd frontend
npm install
npm run build
```

Then start the backend:

```bash
cd ../backend
cargo run
```

The backend serves the built frontend from `../frontend/dist`, so the frontend must be built before the backend is started.

## Running the app

Once the backend is running, it will print the available local and network URLs in the terminal. The default server address is:

- http://localhost:6767/
- ws://\<your-network-ip>:6767/ws

You can also override the bind settings with environment variables:

```bash
export TELEKINO_HOST=0.0.0.0
export TELEKINO_PORT=6767
cargo run
```

## Project structure

```text
.
├── backend/
│   ├── src/
│   ├── Cargo.toml
│   └── target/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── dist/
├── LICENSE
└── README.md
```

## Development notes

- The backend is the main runtime entrypoint and serves the app assets.
- The frontend is developed separately and then built for production.
- The app is designed for trusted local network use and uses a pairing/auth flow before commands are accepted.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
