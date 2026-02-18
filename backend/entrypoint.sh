#!/bin/bash
set -e

# Wait for database to be ready
while ! python -c "import socket; socket.create_connection(('$DB_HOST', $DB_PORT), timeout=1)" 2>/dev/null; do
  echo "Waiting for database at $DB_HOST:$DB_PORT..."
  sleep 1
done

echo "✓ Database is ready!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser if doesn't exist
echo "Setting up admin user..."
python manage.py shell << END
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@local.dev', 'admin')
    print("✓ Created superuser: admin / admin")
else:
    print("✓ Admin user already exists")
END

# Collect static files
python manage.py collectstatic --noinput

echo "✓ Django setup complete. Starting application..."

# Start application
exec "$@"
