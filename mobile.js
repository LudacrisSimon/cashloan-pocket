// Mobile shell only; calculations and local records stay in the original app.
(() => {
 'use strict';
 if(!('serviceWorker' in navigator)||!['http:','https:'].includes(location.protocol))return;
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{
   // Normal online use still works when offline storage is unavailable.
  });
 });
})();
