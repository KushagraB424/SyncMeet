#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Start Gunicorn with Uvicorn workers
gunicorn main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8000} \
    --timeout 120
