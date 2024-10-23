<?php

namespace App\Http\Controllers;
use App\Models\CreateAlbum;
use Illuminate\Http\Request;

class CreateAlbumController extends Controller{
    public function index(){
        return view("createAlbum");
    }

    public function createAlbum(Request $request){     


        return CreateAlbum::create($request);
    }
}