import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/css/button.css',
                'resources/js/app.js',
                'resources/js/keys.js',
                'resources/js/uploadAlbum.js',
                'resources/js/showImage.js',
                'resources/js/uploadImage.js',
                'resources/js/login.js'
            ],
            refresh: true,
        }),
    ],
});
