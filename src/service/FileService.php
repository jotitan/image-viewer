<?php

require_once("../dao/FileDao.php");
require_once("../bean/Folder.php");

class FileService{
   var $dao;

   function FileService(){
      $this->dao = new FileDao();
   }

   /* Renvoie la liste des respertoires d'un repertoire */
   /* Renvoie du json */
   function listFolders($root){
      $folders = $this->dao->listFolders($root);
      $json = json_encode($folders);
      echo $json;
      return $json;
   }

   /* Deplace une photo dans la corbeille */
   function deletePhoto($photo){
      $this->dao->deletePhoto($photo);
      echo "{\"message\":\"ok\"}";
   }



}

?>