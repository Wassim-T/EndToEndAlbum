<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\UserAlbum;

class FetchDataController extends Controller {
    public function fetch(Request $request) {
        if (!$request->ajax()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = Auth::user();



        $publicKey = base64_encode($user->public_key);

        if ($user) {
            return response()->json(['success' => true, 'publicKey' =>$publicKey ]);
        } else {
            return response()->json(['success' => false, 'error' => 'User not authenticated']);
        }
    }

    public function getUsers(Request $request)
    {
        if (!$request->ajax()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $users = UserAlbum::getUsers($request);

        return response()->json(['success' => true, 'users' =>$users]);
    }



    public function getSymmetricKey(Request $request){
        


        $symmetricKey = UserAlbum::getSymmetricKey($request);


        

        

        return response()->json(['success' => true, 'key' => $symmetricKey]);

    }


    public function fetchUserKey($id)
    {
        $key = UserAlbum::getUserPublicKey($id);

        

        return response()->json(['success' => true, 'key' => $key]);
    }




    public function getAlbums(Request $request)     
    {
        if (!$request->ajax()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }


        $albums = UserAlbum::getAlbums();


        return response()->json(['success' => true, 'albums' => $albums]);
    }









}
