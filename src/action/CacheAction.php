<?php

// Gestion du cache. Recoit un chemin en parametre

require_once("../dao/CacheDao.php");
require_once("../dao/FileDao.php");

$filename = FileDao::$winRootFolder . $_GET["file"];
$format = $_GET["format"];

header("Content-type:image/jpeg");
$image = imagecreatefromjpeg(CacheDao::getFile($filename,$format));
ImageJpeg($image);

?>