FROM python:3.12-slim

WORKDIR /app/backend

RUN pip install --no-cache-dir uv

COPY backend/pyproject.toml /app/backend/pyproject.toml
COPY backend/pytest.ini /app/backend/pytest.ini
COPY backend/ruff.toml /app/backend/ruff.toml
COPY backend/mypy.ini /app/backend/mypy.ini
COPY backend /app/backend

RUN uv sync

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
