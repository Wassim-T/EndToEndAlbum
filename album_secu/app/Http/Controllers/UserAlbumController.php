<?php

namespace App\Http\Controllers;

use App\Models\UserAlbum;
use Illuminate\Http\Request;

class UserAlbumController extends Controller
{
    public function index()
    {

        $imageLinks = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/GiraffaCamelopardalisTippelskirchi-Masaai-Mara.JPG/150px-GiraffaCamelopardalisTippelskirchi-Masaai-Mara.JPG";



        return view("userAlbum", ['imageLinks' => $imageLinks]);
    }


    public function shareImage(Request $request)
    {
        return UserAlbum::shareImage($request);

       
    }
    public function shareAlbum(Request $request)
    {
        return UserAlbum::shareAlbum($request);

    }



    public function delete(Request $request)
    {

        return UserAlbum::delete($request);
    }



    public function getUserImages(Request $request)
    {

        if (!$request->ajax()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }


        $images = UserAlbum::load_page();

        return response()->json([
            'success' => true,
            'images' => $images
        ]);
    }


    public function attachImage(Request $request)
    {
        if (!$request->ajax()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }


        return UserAlbum::attach_image($request);


    }


    public function getAlbumImages($album_id)
    {


    //    $images = UserAlbum::load_album_images($album_id);

    //     return response()->json([
    //         'success' => true,
    //         'images' => $images
    //     ]);
    }
}
