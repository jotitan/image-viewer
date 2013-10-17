<!DOCTYPE HTML>
<html>
  <head>
  <?php

   if(stripos($_SERVER["REDIRECT_URL"],"/image-viewer/") == 0){
      $url = str_replace("/image-viewer/","",$_SERVER["REDIRECT_URL"]);
      echo "<meta http-equiv=\"refresh\" content=\"0; URL=/image-viewer?url=" . $url . "\">";
   }

   ?>
  <title>Erreur 404 : page non trouvée</title>
  </head>
  <body>
   
  </body>
</html>
