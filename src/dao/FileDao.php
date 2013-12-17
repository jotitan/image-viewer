<?php

require_once("../bean/Folder.php");
require_once("../dao/CacheRequeteDao.php");

include_once("../../config.php");

class FileDao{
   
   /* Liste les repertoires */
    function listFolders($root){
      $root = $GLOBALS["rootFolder"] . $root;
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
      $fileToDelete = str_replace("/","\\",$GLOBALS["rootFolder"] . $photo);
      $deleteName = $GLOBALS["corbeilleFolder"] . str_replace("/","_",$photo);
      error_log("[" . date("d-m-Y H:i:s") . "] Suppression photo : " . $photo . "\r\n",3,$GLOBALS["deleteLogfile"]);
      if(copy($fileToDelete,$deleteName)){
         // On supprime la source
         if(unlink($fileToDelete)){
             // On invalide le cache de requete
             $cache = new CacheRequeteDao();
             $cache->flush();
         }
      }

   }

   /* Copie la photo dans un repertoire temporaire */
   function copyTempPhoto($photo){
      $srcImage = str_replace("/","\\",$GLOBALS["rootFolder"] . $photo);
      $copyName = $GLOBALS["tempCopyFolder"] . str_replace("/","_",$photo);
      error_log("[" . date("d-m-Y H:i:s") . "] Copie photo : " . $photo . "\r\n",3,$GLOBALS["copyLogfile"]);
      copy($srcImage,$copyName);
   }
}
?>