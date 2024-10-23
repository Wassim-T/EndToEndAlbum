
# Secure Photo Album Management System

## Project Overview

This project aims to implement a secure client/server system for managing photo albums. Users can upload a collection of images to a photo album and share either the entire album or specific images with other users.

## Prerequisites

Make sure you have the following tools installed on your machine:
- PHP >= 8.3
- Composer
- Node.js with npm
- SQLite
- Laragon (optional for simpler setup)
```
## Installation

1. Clone the repository:
   ```
   git clone https://git.esi-bru.be/60344/projet_secu.git
   cd projet_secu/album
   ```

2. Copy the example configuration file `.env`:
   ```sh
   cp .env.example .env
   ```

3. Update Composer dependencies:
   ```sh
   composer update
   ```

4. Install Composer dependencies:
   ```sh
   composer install
   ```

5. Generate the application key:
   ```sh
   php artisan key:generate
   ```

6. Run database migrations:
   ```sh
   php artisan migrate
   ```

7. Install npm dependencies:
   ```sh
   npm install
   ```

8. Build the assets with npm:
   ```sh
   npm run build
   ```

9. Start the development server:
   ```sh
   php artisan serve
   ```

## Using Laragon (for https)

If you prefer to use Laragon for a simpler setup:

1. Download Laragon.
2. Place your project in the `C:\laragon\www` folder.
3. Open Laragon and start all services.
4. For https setup, follow a tutorial for guidance.


