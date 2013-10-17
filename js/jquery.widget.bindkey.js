/* Widget de binding des cles */
$.widget('qs.bindkey',{
   options:{
      key:'',
      action:null

   },
   _init:function(){
      if(this.options.action == null){
         throw {message:"Aucun comportement associé a la cle " + this.options.key};
      }
      var binding = this.element.data("_inner_binding");
      if(binding[this.options.key]==null){
         binding[this.options.key] = this.options.action;
      }
      else{
         throw {message:"Attention, binding deja fait pour la clé " + this.options.key};
      }
   },
   _create:function(){
      // On enregistre le couple key / action dans le body, si le tableau n'existe pas
      var el = this.element;
  
      var binding = new Array();
      el.data("_inner_binding",binding);
      el.bind('keyup.widget_bindkey',function(e){
         var binding = $(this).data("_inner_binding");
         if(binding[e.keyCode]!=null){
            binding[e.keyCode]();
         }
      });
   }
})