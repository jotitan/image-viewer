 <!DOCTYPE html>

<html>

<head>
<script src="lib/jquery-1.9.1.min.js"></script>
<script src="lib/jquery.ui.widget.js"></script>
<script src="lib/gauge.min.js"></script>
<script src="lib/jquery.widget.bindkey.js"></script>
<script src="lib/jquery.percentageloader-0.1.min.js"></script>
<script src="lib/jquery.mobile-1.3.2.min.js"></script>



<link rel="stylesheet" href="styles/jquery.percentageloader-0.1.css">
<link rel="stylesheet" href="styles/gallery.css">

</head>

<body>

<div id="idImage" style="display:none;z-index:10">
   <div style="position: absolute;z-index: 2; width: 99%; height: 99%;"></div>
   <img class="imageHD"/>
   <img class="imageHD"/>
   <button style="position:absolute;right:10px;z-index:3" id="idClose">Fermer</button>
   <img src="/image-viewer/styles/img/ajax-loader.gif" style="display:none" class="loader">
</div>

<div style="display:none;top:5px;left:5px;position:absolute;background-color:white;width:80px;height:80px;border-radius:10px;z-index:15" id="idEtatCache">
   <canvas height="80" width="80"></canvas>
</div>

<div class="chemin">
   <a href="#" id="idLinkAccueil">Accueil</a> :
   <span id="chemin"></span>
   <span id="totalFiles"></span>
   <button data-role="none" style="right:20px;position:absolute" onclick="flush()">Vider le cache</button>
</div>

<ul id="folders"></ul>
<?php

require_once("src/dao/CacheDao.php");

?>
<script src="js/viewer.js"></script>
<script language="Javascript">
   init(<?php echo ((isset($_GET) && isset($_GET['url']))?"'".$_GET["url"]."'":''); ?>);
</script>

</body>
</html>