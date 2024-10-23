<?php

use App\Http\Controllers\CreateAlbumController;
use App\Http\Controllers\FetchDataController;
use App\Http\Controllers\MainPageController;
use App\Http\Controllers\UserAlbumController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadImageController;


Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');






Route::middleware('auth')->group(function () {
    Route::get('/', [UserAlbumController::class, 'index'])->name('user.album');
    Route::post('/', [UserAlbumController::class, 'delete'])->name('userAlbum.delete');
    Route::get('/getUsers', [FetchDataController::class, 'getUsers'])->name('userAlbum.users');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/create', [CreateAlbumController::class, 'index'])->name('create');
    Route::post('/create', [CreateAlbumController::class, 'createAlbum'])->name('create.upload');
    Route::get('/data', [FetchDataController::class, 'fetch'])->name('data');
    Route::post('/images/symmetricKey', [FetchDataController::class, 'getSymmetricKey'])->name('symmetricKey');


    Route::post('/images/shared', [UserAlbumController::class, 'shareImage'])->name('shareImage');
    Route::post('/albums/shared', [UserAlbumController::class, 'shareAlbum'])->name('shareAlbum');


    Route::get('/data/{id}', [FetchDataController::class, 'fetchUserKey'])->name('data.userKey');
    Route::get('/dataImage', [UserAlbumController::class, 'getUserImages'])->name('dataImage');
    Route::get('/dataAlbumImage{album_id}', [UserAlbumController::class, 'getAlbumImages'])->name('dataAlbumImage');
    Route::get('/uploadImage', [uploadImageController::class, 'index'])->name('uploadImage');
    Route::post('/uploadImage', [uploadImageController::class, 'createImage'])->name('uploadImage.upload');
    Route::get('/userAlbums',[FetchDataController::class,'getAlbums'])->name('getAlbums');


    Route::post('/attachImage', [UserAlbumController::class, 'attachImage'])->name('attachImage.upload');


    
});

require __DIR__ . '/auth.php';
