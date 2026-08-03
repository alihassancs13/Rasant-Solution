FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

# ✅ SYSTEM DEPENDENCIES (IMPORTANT FIX)
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ✅ Python deps
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

COPY . .