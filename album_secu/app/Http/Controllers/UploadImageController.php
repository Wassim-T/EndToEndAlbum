<?php

namespace App\Http\Controllers;

use App\Models\CreateImage;
use Illuminate\Http\Request;

class UploadImageController extends Controller
{
    public function index()
    {
        return view("uploadImage");
    }

    public function createImage(Request $request)
    {
        return CreateImage::create($request);
    }
}
