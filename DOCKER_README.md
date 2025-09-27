# Docker Setup for eRecruitment Laravel App

This Docker setup connects your Laravel application to the existing database from your admin app.

## Prerequisites

1. **Admin App Database Running**: Make sure your admin app (eRecruitment Admin) is running with the database container on port 3307.
2. **Docker**: Ensure Docker and Docker Compose are installed and running.

## Quick Start

### Option 1: Using the Setup Script (Recommended)
```bash
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Create .env file** (if it doesn't exist):
   ```bash
   cp docker.env .env
   ```

2. **Update the APP_KEY** in your `.env` file:
   ```bash
   php artisan key:generate
   ```

3. **Build and start the containers**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## Configuration

### Database Connection
The application is configured to connect to your existing admin app database:
- **Host**: `host.docker.internal` (connects to your host machine)
- **Port**: `3307` (from your admin app)
- **Database**: `erecruitment`
- **Username**: `erecruitment_user`
- **Password**: `erecruitment_password`

### Port Configuration
- **Laravel App**: `http://localhost:8001`
- **Admin App**: `http://localhost:8000` (your existing admin app)
- **Database**: `localhost:3307`

## Docker Files Created

- `Dockerfile` - Laravel application container with PHP 8.2, Node.js, and Vite
- `docker-compose.yml` - Container orchestration
- `docker.env` - Environment variables for Docker
- `.dockerignore` - Files to exclude from Docker build
- `docker-setup.sh` - Automated setup script

## Useful Commands

```bash
# View application logs
docker-compose logs -f

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Access container shell
docker-compose exec app bash

# Run Laravel commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan tinker

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
1. Ensure your admin app database is running:
   ```bash
   docker ps | grep erecruitment_mysql
   ```

2. Test database connection from host:
   ```bash
   mysql -h localhost -P 3307 -u erecruitment_user -p erecruitment
   ```

### Application Not Starting
1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep DB_
   ```

### Port Conflicts
If port 8001 is already in use, update the port in `docker-compose.yml`:
```yaml
ports:
  - "8002:8000"  # Change 8001 to 8002 or any available port
```

## Development Workflow

1. **Code Changes**: Your code changes are automatically reflected (volume mounted)
2. **Dependencies**: Install new PHP packages with `composer install` inside container
3. **Frontend**: Install new npm packages and run `npm run build` for production
4. **Database**: Use the shared database from your admin app

## Production Considerations

For production deployment:
1. Update `APP_ENV=production` in environment
2. Set `APP_DEBUG=false`
3. Use proper database credentials
4. Configure proper logging and monitoring
5. Use a reverse proxy (nginx) for better performance
