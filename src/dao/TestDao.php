<?php

include("../../config.php");

 $titi = "truc";

class TestDao{



   public static function test(){
      //echo "cache " . $cacheFolder;
      
      echo "TITI :"  . $GLOBALS["cacheFolder"];
   }
}


TestDao::test();

?>