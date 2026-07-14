$ErrorActionPreference = "Stop"
docker compose up --build -d
Write-Host "Swagger UI started: http://localhost:8085" -ForegroundColor Green
