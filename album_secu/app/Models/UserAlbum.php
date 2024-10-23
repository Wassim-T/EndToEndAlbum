<?php

namespace App\Models;

use \Illuminate\Support\Facades\DB;
use \Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class UserAlbum
{
    public static function load_page()
    {

        $userId = Auth::user()->id;

        $images = DB::table('Utilisateurs_Images')
            ->leftJoin('Images', 'Utilisateurs_Images.image_id', '=', 'Images.id')
            ->leftJoin('Album', 'Utilisateurs_Images.album_id', '=', 'Album.id')
            ->where('Utilisateurs_Images.utilisateur_id', $userId)
            ->select(
                'Images.image',
                'Images.iv',
                'Images.id',
                'Utilisateurs_Images.key',
                'Utilisateurs_Images.description',
                'Utilisateurs_Images.album_id',
                'Images.date_enregistrement',
                'Utilisateurs_Images.proprietaire'
            )->orderBy('Images.id')
            ->get();

        $imageData = [];

        foreach ($images as $image) {
            $imageData[] = [
                'image' => base64_encode($image->image),
                'iv' => $image->iv,
                'key' => $image->key,
                'description' => base64_encode($image->description), // Assuming the description is encrypted and needs to be decrypted on the client-side
                'album_id' => $image->album_id,
                'created_at' => Carbon::parse($image->date_enregistrement)->diffForHumans(),
                'Owner' => $image->proprietaire == $userId,
                'id' => $image->id
            ];
        }


        return $imageData;
    }



    

    public static function delete(Request $request)
    {
        $type = $request->input('type');
        $id = $request->input('id');
    
        $userId = Auth::user()->id;
    
        if ($type == 'album') {
            // Supprimer l'album et ses images associées de l'utilisateur actuel
            DB::beginTransaction();
            try {
                // Récupérer les ID des images associées à cet album et à cet utilisateur
                $id_images = DB::table('Utilisateurs_Images')
                    ->join('Album', 'Utilisateurs_Images.album_id', '=', 'Album.id')
                    ->where('Utilisateurs_Images.utilisateur_id', $userId)
                    ->where('Album.id', $id)
                    ->select('Utilisateurs_Images.image_id')
                    ->get();
    
                // Supprimer les entrées de Utilisateurs_Images associées à cet album et à cet utilisateur
                DB::table('Utilisateurs_Images')
                    ->where('utilisateur_id', $userId)
                    ->where('album_id', $id)
                    ->delete();
    
                // Supprimer l'album de l'utilisateur actuel
                DB::table('Album')
                    ->where('utilisateur_id', $userId)
                    ->where('id', $id)
                    ->delete();
    
                // Supprimer les images associées à cet album et à cet utilisateur
                foreach ($id_images as $id_image) {
                    DB::table('Images')
                        ->where('id', $id_image->image_id)
                        ->where('utilisateur_id', $userId)
                        ->delete();
                }
    
                DB::commit();
                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['success' => false, 'error' => 'Une erreur est survenue lors de la suppression de l\'album.']);
            }
        } else if ($type == 'image') {
            // Supprimer l'image de l'utilisateur actuel
            DB::beginTransaction();
            try {
                // Supprimer l'entrée de Utilisateurs_Images associée à cette image et à cet utilisateur
                DB::table('Utilisateurs_Images')
                    ->where('utilisateur_id', $userId)
                    ->where('image_id', $id)
                    ->delete();
                // Supprimer l'image de l'utilisateur actuel
                DB::table('Images')
                    ->where('utilisateur_id', $userId)
                    ->where('id', $id)
                    ->delete();
                DB::commit();
                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['success' => false, 'error' => 'Une erreur est survenue lors de la suppression de l\'image.']);
            }
        }
    
        return response()->json(['success' => false, 'error' => 'Type de entité invalide.']);
    }
    





    public static function getUsers(Request $request)
    {

        $usersSQL = DB::table('users')->select('id', 'name')->get();

        $users = [];

        foreach ($usersSQL as $sql) {
            $users[] =
                [
                    'id' => $sql->id,
                    'name' => $sql->name
                ];
        }

        return $users;
    }



    public static function getUserPublicKey($id)
    {

        $keySql = DB::table('users')->where('id', $id)->select('public_key')->get();

        $key = $keySql[0]->public_key;

        // Encode la clé en base64
        $encodedKey = base64_encode($key);



        return $encodedKey;
    }



    public static function getAlbums()
    {
        $userId = Auth::user()->id;
    
        $albumsSQL = DB::table('Utilisateurs_Images')
            ->where('proprietaire', $userId)
            ->whereNotNull('album_id')
            ->distinct()
            ->select('album_id','description')
            ->get();
    
        $albums = [];
    
        foreach ($albumsSQL as $sql) {
            $albums[] = [
                'album' => $sql->album_id,
                'description' =>base64_encode($sql->description)
            ];
        }
    
        return $albums;
    }



    public static function getSymmetricKey(Request $request)
    {
        $id = $request->getContent();
        $symmetricKey = DB::table('utilisateurs_images')->where('image_id', $id)->select('key')->get();
        $key = $symmetricKey[0]->key;

        return $key;
    }

    public static function shareImage(Request $request)
    {
        $userId = Auth::user()->id;

        // Get the raw content from the request
        $content = $request->getContent();

        // Decode the JSON content
        $data = json_decode($content, true);

        // Retrieve the specific data elements
        $idImage = $data['id2'] ?? null;
        $encryptedSymmetricKey = $data['finalEncryptedSymmetricKey'] ?? null;
        $newUser = $data['destUser'] ?? null;

        // Validate the data
        if (is_null($idImage) || is_null($encryptedSymmetricKey) || is_null($newUser)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required parameters.'
            ], 400); // Return a 400 Bad Request response if validation fails
        }

        try {
            DB::beginTransaction();

            DB::table('Utilisateurs_Images')->insert([
                'utilisateur_id' => $newUser,
                'image_id' => $idImage,
                'album_id' => null,
                'key' => $encryptedSymmetricKey,
                'description' => null,
                'proprietaire' => $userId
            ]);

            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500); // Return a 500 Internal Server Error response if an exception occurs
        }
    }


    public static function attach_image(Request $request)
    {
        $content = $request->getContent();
        $data = json_decode($content, true);
    
        // Retrieve the specific data elements
        $imageId = $data['id3'] ?? null;
        $destAlbum = $data['destAlbum'] ?? null;
    
        // Validate the data
        if (is_null($imageId) || is_null($destAlbum)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required parameters.'
            ], 400); // Return a 400 Bad Request response if validation fails
        }
    
        // Update the database table
        try {

            $descriptionSql = DB::table('Utilisateurs_Images')->where('album_id',$destAlbum)->select('description')->get();

            $description = $descriptionSql[0]->description;


            DB::beginTransaction();
            DB::table('Utilisateurs_Images')
                ->where('image_id', $imageId)
                ->update(['album_id' => $destAlbum, 'description' => $description]);
            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => 'An error occurred while attaching the image to the album.']);
        }
    }


    public static function shareAlbum(Request $request)
    {
        $userId = Auth::user()->id;


        $content = $request->getContent();


        $data = json_decode($content, true);

        // Retrieve the specific data elements
        $idAlbum = $data['albumId'] ?? null;
        $encryptedSymmetricKey = $data['finalEncryptedSymmetricKey'] ?? null;
        $newUser = $data['destUser'] ?? null;
        $encryptedText = $data['encryptedText'] ?? null;

        // Validate the data
        if (is_null($idAlbum) || is_null($encryptedSymmetricKey) || is_null($newUser) || is_null($encryptedText)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required parameters.'
            ], 400); // Return a 400 Bad Request response if validation fails
        }





        try {
            DB::beginTransaction();

            $id_images = DB::table('Utilisateurs_Images')
                ->where('album_id', $idAlbum)
                ->select('image_id')
                ->get();

        

            foreach ($id_images as $id_image) {
                
                DB::table('Utilisateurs_Images')->insert([
                    'utilisateur_id' => $newUser,
                    'image_id' => $id_image->image_id,
                    'album_id' => $idAlbum,
                    'key' => $encryptedSymmetricKey,
                    'description' => base64_decode($encryptedText),
                    'proprietaire' => $userId
                ]);
             
                
            }

           


            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500); // Return a 500 Internal Server Error response if an exception occurs
        }
    }
}
