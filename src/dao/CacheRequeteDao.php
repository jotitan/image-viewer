<?php
   /* Cache de requete */

class CacheRequeteDao{
   var $cache;
   public function __construct(){
      $this->cache = new MemCache();
      $this->cache->pconnect('localhost', 11211);
   }

   function contains($key){
      return $this->cache->get($key)!=null;
   }

   function put($key,$data){
      $this->cache->set($key,$data);
   }

   function get($key){
      return $this->cache->get($key);
   }
   /* Vide le cache */
   function flush(){
      $this->cache->flush();
   }
}

?>