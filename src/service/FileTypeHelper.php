<?php

/* Fournit les methodes de determination du type de media */

class FileTypeHelper{
   static $types = array(
      "jpg" => "IMG",
      "jpeg" => "IMG",
      "gif" => "IMG",
   );

   public static function getType($filename){
      $extension = strtolower(substr($filename,strrpos($filename,".")+1));
      if(array_key_exists($extension,FileTypeHelper::$types)){
         return FileTypeHelper::$types[$extension];
      }
      return "NONE";
   }
}

?>