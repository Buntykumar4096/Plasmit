#!/usr/bin/env sh
set -eu
docker compose up --build -d
echo "Swagger UI started: http://localhost:8085"
