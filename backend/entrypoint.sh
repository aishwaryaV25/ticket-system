#!/bin/bash
set -e

# Wait for database to be ready
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Waiting for database at $DB_HOST:$DB_PORT..."
  sleep 1
done

echo "Database is ready!"

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

echo "Django setup complete. Starting application..."

# Start application
exec "$@"
