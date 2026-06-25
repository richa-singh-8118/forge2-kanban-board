FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite pdo

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN touch database/database.sqlite
RUN php artisan migrate:force --seed

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
