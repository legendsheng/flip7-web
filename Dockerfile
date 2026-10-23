# Flip 7 - Lightweight Container Image
FROM python:3.11-alpine

WORKDIR /app

# Zero external dependencies - uses standard library only
COPY server.py ./
COPY public/ ./public/

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["python3", "server.py"]
