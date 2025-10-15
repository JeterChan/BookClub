FROM python:3.11-slim-bullseye

# Set working directory to the project root in the container
WORKDIR /usr/src/app

# Install system dependencies required for psycopg2 and netcat
RUN apt-get update && apt-get install -y libpq-dev gcc netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Set the working directory to the backend folder
WORKDIR /usr/src/app/backend

EXPOSE 8000

# On startup, wait for db, run migrations and then start the server
CMD ["sh", "-c", "while ! nc -z db 5432; do echo 'Waiting for database...'; sleep 1; done; echo 'Database is ready!'; alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir app"]