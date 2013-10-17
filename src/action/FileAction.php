<?php

session_start();
header('Content-type: application/json;charset=utf-8');
require_once('../service/FileService.php');
require_once('../dao/CacheRequeteDao.php');

if(!isset($_POST) || sizeof($_POST) == 0){
	if(!isset($_GET)){return;}
	$act = 0;
   if(isset($_GET['action'])){
      $act = $_GET['action'];
   }
   $_POST = $_GET;
}
else{
	$act = $_POST['type'];
	if(!isset($_POST['type'])){$act = $_POST['action'];}
	if($act==null){
		$act = $_GET['action'];
	}
}

$service = new FileService();

if($_SERVER['REQUEST_METHOD'] == 'DELETE'){
   $service->deletePhoto($_POST['photo']);
   return;
}

$d = microtime(true);
$cache = new CacheRequeteDao();

$key = "";  // La cle est composee de tous les parametres
foreach($_POST as $param => $value){
   $key.=$param . "=" . $value . ",";
}


if($act!=2 && $cache->contains($key)){ // flush non mis en cache
   echo $cache->get($key);
   error_log("CacheTime : " . (microtime(true) - $d));
   return;
}

$result = "";
switch($act){
case 1 :
   $result = $service->listFolders($_POST['root']);
   error_log("Time : " . (microtime(true) - $d));
   break;
case 2 :
   $cache->flush();
   return;
default : break;

}
$cache->put($key,$result);


?>