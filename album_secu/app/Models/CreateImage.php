<?php

namespace App\Models;

use \Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;



class CreateImage
{
    public static function create(Request $request){

        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1', // "files" doit être un tableau avec au moins un élément
         ]);
   
         if ($validator->fails()) {
            
            return redirect()->back()->withErrors($validator)->withInput();
         }


         $ivs = json_decode($request->input('iv'), true);

         $files = $request->file('files');
   
         $encryptedKey = $request->input('encryptedKey');

         $userId = $request->user()->id;


         DB::beginTransaction();

      try {

         foreach ($files as $index => $file) {
            $fileData = file_get_contents($file->getPathname());
            $iv = $ivs[$index];

            if (is_array($iv)) {
               // Convert $iv to a string if it is an array
               $iv = implode(',', $iv);
            }

            $imageContents = $fileData;

            // Insert image into the Images table
            $imageId = DB::table('Images')->insertGetId([
               'image' => $imageContents,
               'date_enregistrement' => Carbon::now(),
               'iv' => $iv
            ]);

            

            DB::commit();
            DB::beginTransaction();

            // Insert association into the Utilisateurs_Images table
            DB::table('Utilisateurs_Images')->insert([
               'utilisateur_id' => $userId,
               'image_id' => $imageId,
               'album_id' => null,
               'key' => $encryptedKey,
               'description' => null,
               'proprietaire' => $userId
            ]);
         }


         DB::commit();




         return redirect()->back()->with('success');
      } catch (\Exception $e) {
         dd($e->getMessage());
         DB::rollBack();
         return redirect()->back()->withErrors("error")->withInput();
      }
   }







    }
    
    
