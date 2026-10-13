.PHONY: all run front-build front-dev backend-build backend-run build

all: run

build: front-build backend-build

front-build:
	cd frontend && npm run build

front-dev:
	cd frontend && npm run dev

backend-build:
	cd backend && cargo build

backend-run:
	cd backend && cargo run

run: front-build
	cd backend && cargo run