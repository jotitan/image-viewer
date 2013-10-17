<?php

require_once("../service/FileTypeHelper.php");

class Folder{
   var $name;
   var $path;

   function Folder($path){
      $this->path = $path;
      if(($pos = strrpos($path,"/"))!=false){
         $this->name = substr($this->path,$pos+1);
      }
      else{

      }
   }
}

class File{
   var $name;
   var $path;
   var $type;

   function File($path){
      $this->path = $path;
      if(($pos = strrpos($path,"/"))!=false){
         $this->name = substr($this->path,$pos+1);
      }
      $this->type = FileTypeHelper::getType($this->name);
   }
}

?>