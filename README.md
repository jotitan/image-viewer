image-viewer
============

App web permettant de visualiser les photos sur un disque réseau

Fonctionnalités : 

Gestion d'un cache d'image (redimensionnement à la volée miniature et version écran). Fonctionne avec irfanview (windows). Version ImageMagick en cours.
Sauvegarde de l'arborescence des fichiers dans un cache memcached (listing des répertoires / fichiers trop long).
Fonctionnalités : 
* Suppression des photos (log de l'action + deplacement dans un répertoire corbeille).
* Copie d'une photo dans une répertoire spécial (touche V).
Prend en charge le swipe pour naviguer dans les photos.

Il faut configurer le fichier config.php avec les chemins suivants :
* Chemin du répertoire photo (rootFolder)
* Chemin du répertoire de cache (cacheFolder)
* Chemin du répertoire de la corbeille (corbeilleFolder)
* Chemin du répertoire de sauvegarde (tempCopyFolder)
