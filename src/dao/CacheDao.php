<?php

include_once("../../config.php");

class CacheDao {
   static $windowsSoftware = "\"c:\Program Files (x86)\IrfanView\i_view32.exe\" ";
   static $availableFormats = array(
      "THU"=>100,
      "LOW"=>150,
      "MED"=>450,
      "BIG"=>800,
      "HD"=>1080
   );


   static function getFile($filename,$format){
      // On verifie le format
      if(!array_key_exists($format,CacheDao::$availableFormats)){
         throw new Exception("Format " . $format . " inconnu");
      }
      //$f = CacheDao::defineFilename($filename,$format,CacheDao::$cacheFolder);
      $winOut = CacheDao::defineFilename($filename,$format,$GLOBALS["cacheFolder"]);
      if(!CacheDao::isPhotoInCache($winOut)){
         CacheDao::resizeImageWindows($filename,$winOut,CacheDao::$availableFormats[$format]);
    		//CacheDao::resizeImage($filename,$f,CacheDao::$availableFormats[$format]);
    	}
    	return $winOut;
   }

static function resizeImageWindows($fileIn,$fileOut,$height){
   $command = $GLOBALS["windowsSoftware"] . " " . str_replace("/","\\",$fileIn)
      . " /jpgq=80 /resize=(0," . $height . ") /resample /aspectratio /convert=" . $fileOut;
   system($command);
}

static function resizeImageMagic($fileIn,$fileOut,$height){
   $command = "convert " . str_replace("/","\\",$fileIn) . "-resize x" . $height
      . " -auto-orient -interpolate bicubic -quality 80 " . $fileOut;
   system($command);
}

/* Redimensionne l'image au bon format. On fixe la hauteur ? */
 static function resizeImage($fileIn,$fileOut,$height){
	// On met le plus long cote a 480px
	$source = imagecreatefromjpeg($fileIn);
   $size = getImageSize($fileIn);
	$width = ($height / $size[1]) * $size[0];
   $angle = 0;
	if(($orientation = exif_read_data($fileIn)["Orientation"])!=1){
      // On change le côté long
      $width = $height;
      $height = ($width / $size[0]) * $size[1];
      $angle = ($orientation == 6)?-90:(($orientation == 8)?90:0);
   }
	$img = imagecreatetruecolor($width,$height);
   imagecopyresampled($img, $source, 0, 0, 0, 0, $width, $height, $size[0],$size[1]);
   if($angle!=0){
      $img = imagerotate ($img,$angle,0);
   }
	imagejpeg($img,$fileOut);	// Ecrit le fichier
}

/* Verifie si l'image existe pour un format donne */
static function isPhotoInCache($file){
	return is_file($file);
}

   static function defineFilename($file,$format,$cacheFolder){
    	$md5 = md5($format . "_" . $file);
      $info = pathinfo($file);
    	return $cacheFolder . $md5 . "." . $info["extension"];
    }
}

?>