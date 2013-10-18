var basename = "/image-viewer";
var contextPath = "http://" + location.host + basename;
var cacheUrl = basename + "/src/action/CacheAction.php?file=";
var currentRoot = "";
var currentDirectory = ""; // repertoire courant
var currentPhoto = "";  // Photo courante

/* Vide le cache de requuete */
function flush(){
   $.ajax({url:basename + "/src/action/FileAction.php?action=2"})
}

/* Barre de progression */
var ProgressBar = {
   loader:null,
   divLoader:null,
   totalNb:0,
   currentNb:0,
   observers:[],
   threadSupervision:null,   // Thread qui surveille le chargement des photos
   // Cree le loader
   create:function(nb,images){
      if(this.loader!=null){
         this.divLoader.empty();
      }
      this.currentNb = 0;
      this.totalNb = nb;
      this.loader = this.divLoader.percentageLoader({
         width : 120, height : 120, progress : 0, value : '0 / ' + this.totalNb
      });
      $(images).each(function(){$('img',this).load(function(){
         ProgressBar.update($(this));
      })});
      this.startLoad();
   },
   /* Demarre la surveillance du chargement des miniatures. */
   /* Lors de l'affichage des miniatures, des timeouts se produisent et l'image n'est pas affiche. */
   startLoad:function(){
      this.divLoader.fadeIn(1500)
      if(this.threadSupervision){
         clearInterval(this.threadSupervision);
      }
      this.threadSupervision = setInterval(function(){
         $('img:not([done])',FolderManager.divFolders).each(function(){
            // On verifie le timestamp. Si superieur a 30 sec, on recharge
            var time = (new Date().getTime() - parseInt($(this).data('timestamp')))/1000;
            if(time > 30000){
               // On recharge l'image
               console.log("Recharge " + $(this).attr('src'));
            }
         });
      },15000);
   },
   /* Mets fin au chargement des miniatures */
   endLoad:function(){
      this.divLoader.fadeOut(2000);
      if(this.threadSupervision){
         clearInterval(this.threadSupervision);
      }
   },
   update:function(img){
      this.currentNb++;
      var pas = this.currentNb / this.totalNb;
      this.loader.setProgress(pas);
      this.loader.setValue(this.currentNb + ' / ' + this.totalNb);
      img.attr('done','true');   // Indique que l'image est chargee
      if(pas == 1){
         this.endLoad();
      }
      this.updateObservers(this.currentNb);
   },
   init:function(){
      this.divLoader = $('<div style="position:fixed;width:120px;height:120px;right:5px;top:5px;display:none" id="loader"></div>');
      $('body').append(this.divLoader);
      return this;
   },
   observe:function(o){
      this.observers.push(o);
   },
   updateObservers:function(nb){
      for(var idx in this.observers){
         this.observers[idx].updateTotal(nb);
      }
   }
}.init();


var CheminFer = {
   chemin:$('#chemin'),
   totalSpan:$('#totalFiles'),
   lastNb:0,
   change:function(path){
      this.chemin.empty();
      this.totalSpan.text('');
      var chunks = path.split(new RegExp(/\/|\\/));
      var currentDir = "";
      $(chunks).each(function(i){
         currentDir = currentDir + ((currentDir!="")?"/":"") + this;
         var link = $('<a href="#" data-link="' + currentDir + '">' + this + '</a>');
         link.bind('click',function(e){
            FolderManager.loadFolder($(this).data('link'));
            e.preventDefault();
         });
         if(i>0){CheminFer.chemin.append(" > ");}
         CheminFer.chemin.append(link)
      });
   },
   setNb:function(nb){
      this.lastNb = nb;
      if(nb!=null && nb > 0){
         CheminFer.totalSpan.text(' (' + nb + ')');
      }
      else{
         CheminFer.totalSpan.text('');
      }
   },
   decreaseNb : function(){
      this.setNb(--this.lastNb);
   }
}

/* Gere le prechargement des images */
var PreloadCache = {
   cacheImages : new Array(), // sauvegarde temporairement les images, taille 5
   imagesNames : new Array(), // nom des images deja charges
   lastIndex : 0,
   NB_PRELOAD : 8,
   nb_loaded : 8, // Nombre de photo chargee dans le cache
   gauge:null,
   /* Charge les photos indiquees en memoire */
   loadNexts : function(photos){
      $(photos).each(function(){
         var photo = $(this).data('name');
         PreloadCache.loadPhoto(photo);
      });
   },
   loadPhoto : function(photo){
      if(this.imagesNames[photo] == null){
         var url = cacheUrl + photo + "&format=HD";
         this.cacheImages[this.lastIndex] = new Image();
         this.cacheImages[this.lastIndex].src = url;
         this.nb_loaded--;
         this.gauge.set(this.nb_loaded);
         $(this.cacheImages[this.lastIndex]).load(function(){
            PreloadCache.nb_loaded++;
            PreloadCache.gauge.set(PreloadCache.nb_loaded);
         });
         this.imagesNames[photo] = true;
         this.lastIndex = (this.lastIndex+1)%this.NB_PRELOAD;
      }
   },
   showGauge:function(){
      $('#idEtatCache').fadeIn(400);
   },
   hideGauge:function(){
      $('#idEtatCache').fadeOut(200);
   },
   init:function(){
      var opts = {
         lines: 12,
         angle: 0.25,
         lineWidth: 0.44,
         strokeColor: '#BBBBBB',
         colorStart: '#EEEEEE',
         enerateGradient: true,
         pointer:{
           length:0.8,
           color:'black',
           strokeWidth:0.02
         }
      }
      this.gauge = new Gauge($('#idEtatCache > canvas').get(0)).setOptions(opts);
      this.gauge.maxValue = this.NB_PRELOAD;
      this.gauge.animationSpeed = 10;
      this.gauge.set(this.NB_PRELOAD);

      return this;
   }
}.init();

/* Gestionnaire de repertoire */
var FolderManager = {
   divImage : $('#idImage'),
   divFolders : $('ul#folders'),
   blocSize:5,   // Taille des blocs image
   cache:new Array(),   // cache d'image (charge les 5 prochaines)
   currentImages:null,  // Image actuellement affichees
   /* Charge le repertoire a partir d'une url */
   loadUrl : function(url){
       if(url.toLowerCase().match(new RegExp(/\.[a-z]{2,4}/))){
          this.loadPhoto(url);
       }
       else{
          this.loadFolder(url,true);
       }
   },
   /* Requete serveur : recupere le contenu d'un repertoire */
   getContentFolder : function(){
       if(this._normalize(currentDirectory) == this._normalize(currentRoot) && currentRoot!=""){
          return;  // On ne recharge pas
       }
       CheminFer.change(currentRoot);
       currentDirectory = currentRoot;
        $.ajax({
           url:basename + "/src/action/FileAction.php",
           data:{action:1,root:currentRoot.replace("\\","\\\\")},
           success:function(data){
             FolderManager.showFolders(data);
           }
        });
    },
   /* Charge un repertoire */
   loadFolder:function(folder,notUpdateHistory){
      this.hidePhoto();
      if(!notUpdateHistory){
         history.pushState(folder,"Repertoire",contextPath + "/" + folder);
      }
      currentRoot=folder;
      this.getContentFolder();
   },
   /* affiche les repertoires */
   showFolders:function(folders){
      $('ul#folders').empty();
      var images = new Array();
      $(folders).each(function(){
         if(this.type==null){ // FOLDER
            FolderManager.divFolders.append('<li data-type="dir" data-name="' + this.name + '">' + this.name + '</li>');
         }
         else{ // FICHIER
            // on affiche progressivement les images (10 par 10)
            if(this.type == "IMG"){
               var img = currentRoot + "/" + this.name;
               images.push($('<li data-type="img" data-name="' + img + '"><img src="' + basename + '/src/action/CacheAction.php?file=' + img + '&format=LOW"/></li>'));
            }
         }
      });
      if(images.length > 0){
         // On initialise la progress bar
         ProgressBar.create(images.length,images);
      }
      this.currentImages = images;
      this.showImagesByBorne(this.currentImages,0,this.blocSize);
      //FolderManager.divFolders.append(images);
      CheminFer.setNb(images.length);
   },
   /* Affiche les images par bloc de longueur size. Permet de fluidifier le chargement */
   showImagesByBorne:function(images,from,size){
      for(var i = from ; i < from + size && i < images.length ; i++){
         images[i].data('timestamp',new Date().getTime());
         FolderManager.divFolders.append(images[i]);
      }
   },
   /* Appele chaque fois qu'une photo est mise a jour */
   updateTotal:function(nb){
      // Quand on atteint un palier de 10, on affiche
      if(nb%this.blocSize == 0){
         // on charge
         this.showImagesByBorne(this.currentImages,nb,this.blocSize);
      }
   },
   /* Charge une photo */
   /* @param keepPhoto : cache l'ancienne photo */
   /* On utilise 2 calques pour utiliser le chargement. On charge dans le bloc qui n'est pas actif, on l'affiche quand c'est charge */
   loadPhoto:function(photo,keepPhoto){
      this.showPhoto();
      if(this._normalize(currentPhoto) == this._normalize(photo) && photo!=""){
         return;  // On ne recharge pas
      }
      // On cache la photo, on affiche le sablier
      this.divImage.find('img.loader').fadeIn(200);
      if(!keepPhoto){   // quand c'est le premier affichage, on cache l'image precedemment chargee
         this.divImage.find('img.imageHD').hide();
      }
      currentPhoto = photo;
      currentRoot = photo;
      history.pushState(photo,"Image",basename + '/' + photo);
      var img = photo + "&format=HD";
      this.divImage.find('img.imageHD:not(.active):first').attr('src',basename + '/src/action/CacheAction.php?file=' + img).addClass('onload_image');
   },
   /* affiche l'image qui vient d'etre chargee*/
   showLoadedPhoto : function(){
      // On fadeIn onload_image, on fadeOut active. Si pas d'active, rien
      this.divImage.find('img.imageHD.onload_image').fadeIn(500);
      this.divImage.find('img.imageHD.active').fadeOut(500).removeClass("active");
      this.divImage.find('img.imageHD.onload_image').removeClass("onload_image").addClass("active");
      FolderManager.divImage.find('img.loader').fadeOut(300);
      // On lance le chargement des images suivantes
      PreloadCache.loadNexts(this.getNexts(PreloadCache.NB_PRELOAD));
   },
   /* On ferme la photo */
   closePhoto : function(){
      if(!this.isPhotoDisplayed()){return;}
      // On cherche le repertoire (en cherchant le dernier / \ )
      var pos = Math.max(currentRoot.lastIndexOf("/"),currentRoot.lastIndexOf("\\"));
      if(pos == -1){
         // Cas impossible, erreur
         return;
      }
      this.hidePhoto();
      this.loadFolder(currentRoot.substring(0,pos));
    },
    /* Deplace la photo dans un repertoire poubelle */
    deletePhoto : function(){
      if(!confirm("Etes vous sur de vouloir supprimer la photo")){return;}
      if(!this.isPhotoDisplayed()){return;}
      // On effectue la suppression visuelle maintenant (car elle prend du temps)
      var photo = currentPhoto;
      this._deletePhotoFromUI();
      $.ajax({
         url:basename + '/src/action/FileAction.php?photo=' + photo,
         type:'DELETE',
         success:function(data){
            if(data!=null && data.message == "ok"){

            }
            else{
               alert("probleme de suppression");
            }
         },
         error:function(){
            alert("probleme de suppression");
         }
      })
    },
    _deletePhotoFromUI:function(){
        var photo = currentPhoto;
        // On affiche l'image suivante, si elle n'existe pas, la precedente, sinon, on cache le bloc
        if(!FolderManager.nextPhoto()){
           if(!FolderManager.previousPhoto()){
              FolderManager.closePhoto();
           }
        }
        // On supprime le li du bloc
        $('li[data-name*="' + photo + '"]').remove();
        CheminFer.decreaseNb();

    },
   /* Normalise le chemin pour permettre la comparaison */
   _normalize:function(path){
      return decodeURIComponent(path).replace("\\","/");
   },
   showPhoto : function(){
      PreloadCache.showGauge();
      this.divImage.show();
      this.divFolders.hide();
   },
   hidePhoto : function(){
      PreloadCache.hideGauge();
      this.divImage.hide();
      this.divFolders.show();
   },
   /* Indique si une photo est actuellement affichee */
   isPhotoDisplayed : function(){
      return this.divImage.is(':visible');
   },
   /* Envoie les images qui suivent celle affichees */
   getNexts : function(nb){
      var name = currentPhoto.substring(currentPhoto.lastIndexOf("/")+1);
      return $('li:has(img[src*="' + name + '"])~li:lt(' + nb + ')');
   },
   nextPhoto : function(){
      if(!this.isPhotoDisplayed()){return false;}
      var name = currentPhoto.substring(currentPhoto.lastIndexOf("/")+1);
      var img = $('li:has(img[src*="' + name + '"])').next();
      if(img.length == 0){return false;}
      this.loadPhoto(img.data("name"),true);
      return true;
   },
   previousPhoto : function(){
      if(!this.isPhotoDisplayed()){return false;}
      var name = currentPhoto.substring(currentPhoto.lastIndexOf("/")+1);
      var img = $('li:has(img[src*="' + name + '"])').prev();
      if(img.length == 0){return false;}
      this.loadPhoto(img.data("name"),true);
      return true;
   },
   init:function(){
      this.divImage.find('img.imageHD').load(function(){
         FolderManager.showLoadedPhoto();
      });
      try{
          $('body').bindkey({key:27,action:function(){FolderManager.closePhoto();}})
          $('body').bindkey({key:37,action:function(){FolderManager.previousPhoto();}})
          $('body').bindkey({key:39,action:function(){FolderManager.nextPhoto();}})
          $('body').bindkey({key:46,action:function(){FolderManager.deletePhoto();}})
      }catch(e){
         console.log(e);
      }
      ProgressBar.observe(this);
      return this;
    }


}.init();

function init(loadUrl){
   $('#idClose').bind('click',function(){
      FolderManager.closePhoto();
   });

    $('ul').on('click','li[data-type="dir"]',function(){
         FolderManager.loadFolder(currentRoot + ((currentRoot!="")?"/":"") + $(this).data("name"));
    });

   $('ul').on('click','li[data-type="img"]',function(){
         FolderManager.loadPhoto($(this).data("name"));
    });

   $('#idImage').on('swipeleft',function(){
      FolderManager.nextPhoto();
   });

   $('#idImage').on('swiperight',function(){
      FolderManager.previousPhoto();
   });
      // Gere le retour arriere
    $(window).bind('popstate',function(state){
         // On recupere le chemin
         currentRoot = state.target.location.pathname.replace(basename + "/","");
         FolderManager.loadUrl(currentRoot);
    });

   $('#idLinkAccueil').click(function(e){
      FolderManager.loadFolder('');
      e.preventDefault();
   });

   /* Hack pour freebox */
   if(navigator.userAgent.indexOf("FbxQmlTV Safari")!=-1){
      $('#idImage').css({width:window.innerWidth,height:1080})
   }
   else{
       $('#idImage').css({width:window.innerWidth,height:window.innerHeight})
       $(window).unbind('resize').bind('resize',function(){
          $('#idImage').css('height',window.innerHeight);
       })
   }
   if(loadUrl && loadUrl!=''){
      FolderManager.loadUrl(loadUrl);
   }
   else{
      FolderManager.getContentFolder();
   }
}