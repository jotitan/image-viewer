<?php

require_once("../bean/Folder.php");
require_once("../dao/CacheRequeteDao.php");

class FileDao{
   static $rootFolder = "y:\\PHOTOS\\"; // Repertoire de base ou se trouve les photos
   static $winRootFolder = "y:\\PHOTOS\\"; // Repertoire de base ou se trouve les photos
   static $corbeilleFolder = "y:\\CORBEILLE\\";
   static $logfile = "D:\\Logs\\Viewer\\suppression_photo.log";

   /* Liste les repertoires */
    function listFolders($root){
      $root = FileDao::$rootFolder . $root;
       $list = array();
        foreach(scandir($root) as $dir){
          if($dir!="." && $dir != ".."){
            if(is_dir($root . "/" . $dir)){
               $list[sizeof($list)] = new Folder($root . "/" . $dir);
            }
            else{
               $list[sizeof($list)] = new File($root . "/" . $dir);
            }
          }
        }
        return $list;
    }

   /* Supprime une photo en la deplacant dans un repertoire. On log les suppressions. */
   function deletePhoto($photo){
      $fileToDelete = str_replace("/","\\",FileDao::$rootFolder . $photo);
      $deleteName = FileDao::$corbeilleFolder . str_replace("/","_",$photo);
      error_log("[" . date("d-m-Y H:i:s") . "] Suppression photo : " . $photo . "\r\n",3,FileDao::$logfile);
      if(copy($fileToDelete,$deleteName)){
         // On supprime la source
         if(unlink($fileToDelete)){
             // On invalide le cache de requete
             $cache = new CacheRequeteDao();
             $cache->flush();
         }
      }

   }
}
?>