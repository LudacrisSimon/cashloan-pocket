const VERSION='2026.10.17';
const CACHE='cashloan-pocket-0fb583418c3bdc9f';
const FILES=["index.html", "mobile.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"].map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('cashloan-pocket-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE')self.skipWaiting();
 if(event.data?.type==='VERSION')event.ports[0]?.postMessage({version:VERSION,cache:CACHE});
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.href.startsWith(self.registration.scope)){
  event.respondWith((async()=>{
   const cached=async()=>{const response=await caches.match(new URL('index.html',self.registration.scope).href);return response?new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers}):undefined};
   let timer;const controller=new AbortController();
   try{timer=setTimeout(()=>controller.abort(),4000);const response=await fetch(request,{signal:controller.signal,cache:'no-cache'});if(response.ok)return response;return await cached()||response}
   catch{return await cached()||Response.error()}finally{clearTimeout(timer)}
  })());return;
 }
 url.search='';
 if(FILES.includes(url.href))event.respondWith(caches.open(CACHE).then(cache=>cache.match(url.href)).then(response=>response||fetch(request)));
});
