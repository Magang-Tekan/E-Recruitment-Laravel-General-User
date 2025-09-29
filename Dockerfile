# Use PHP 8.4 with FPM (matching your local version)
FROM php:8.4-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application code first
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-interaction

# Install Node.js dependencies (including dev dependencies for build)
RUN npm ci

# Build frontend assets for production
RUN npm run build

# Keep dev dependencies for development
# RUN npm prune --production

# Create storage directories and set permissions
RUN mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port 8001
EXPOSE 8001

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8001"]

