const CACHE='cashloan-pocket-3422c8e614e5a1cb';
const FILES=["index.html", "mobile.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"].map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('cashloan-pocket-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.href.startsWith(self.registration.scope)){
  event.respondWith((async()=>{
   const cached=async()=>{
    const response=await caches.match(new URL('index.html',self.registration.scope).href);
    // Static hosts may redirect index.html to /. Navigation cannot reuse that
    // redirected fetch response in manual redirect mode; preserve its document.
    return response?new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers}):undefined;
   };
   let timer;const controller=new AbortController();
   try{timer=setTimeout(()=>controller.abort(),4000);const response=await fetch(request,{signal:controller.signal});
    if(response.ok)return response;
    return await cached()||response;
   }catch{const response=await cached();return response||Response.error()}
   finally{clearTimeout(timer)}
  })());return;
 }
 if(FILES.includes(url.href))event.respondWith(caches.match(request).then(response=>response||fetch(request)));
});
