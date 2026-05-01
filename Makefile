SHELL := /bin/sh

.PHONY: bootstrap dev dev-frontend test lint docker-up docker-down rebuild

bootstrap:
	cd backend && uv sync --extra dev
	cd frontend && npm ci

dev:
	docker compose up db -d
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

test:
	cd backend && uv run pytest
	cd frontend && npm run test

lint:
	cd backend && uv run ruff check .
	cd frontend && npm run lint

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v --remove-orphans

rebuild:
	docker compose down --remove-orphans
	docker compose build --no-cache
