#!/bin/bash
set -e

echo "🔥 Generating Firebase credentials..."
python scripts/generate_firebase_creds.py

echo "📦 Running database migrations..."
python manage.py migrate --noinput

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Gunicorn server..."
exec gunicorn deadline_api.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
