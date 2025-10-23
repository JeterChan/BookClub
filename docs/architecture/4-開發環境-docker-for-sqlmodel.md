# 4. 開發環境 (Docker for SQLModel)

## a. Python 依賴 (`requirements.txt`)
```
fastapi
uvicorn[standard]
sqlmodel
alembic
psycopg2-binary
python-dotenv
bcrypt
```

## b. API Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim-bullseye

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app
COPY ./alembic ./alembic
COPY alembic.ini .

EXPOSE 8000

# 在啟動時，先執行資料庫遷移，再啟動伺服器
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

## c. Docker Compose (`backend/docker-compose.yml`)
```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bookclub_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ..  # 建置上下文是專案根目錄
      dockerfile: backend/Dockerfile # Dockerfile 的路徑
    ports:
      - '8000:8000'
    depends_on:
      - db
    volumes:
      - ./app:/usr/src/app/app # 掛載原始碼以實現熱重載
    environment:
      DATABASE_URL: "postgresql://user:password@db:5432/bookclub_dev"

volumes:
  postgres_data:
```