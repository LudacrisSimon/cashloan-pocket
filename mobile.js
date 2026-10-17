// Offline updates only replace app resources. IndexedDB and drafts stay untouched.
(() => {
 'use strict';
 if(!('serviceWorker' in navigator)||!['http:','https:'].includes(location.protocol))return;
 const version=document.querySelector('meta[name="app-version"]').content;
 const button=document.createElement('button');button.id='update-offline';button.type='button';button.textContent='刷新离线缓存';
 document.querySelector('.menu-sheet').append(button);
 const status=document.createElement('span');status.id='mobile-cache-status';status.setAttribute('role','status');status.className='mobile-cache-status';document.querySelector('.utility-footer').append(status);
 let registration;
 const report=(text,ok=false)=>{status.textContent=text;status.dataset.ready=String(ok)};
 function waitInstalled(worker){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.removeEventListener('statechange',check);reject(new Error('缓存准备超时'))},20000);function check(){if(worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',check);resolve()}else if(worker.state==='redundant'){clearTimeout(timer);worker.removeEventListener('statechange',check);reject(new Error('缓存未能完成'))}}worker.addEventListener('statechange',check);check()})}
 function workerVersion(worker){return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>reject(new Error('缓存尚未就绪')),4000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data)};worker.postMessage({type:'VERSION'},[channel.port2])})}
 async function refresh(){button.disabled=true;report('正在更新缓存');try{
  registration=registration||await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  await registration.update();
  if(registration.waiting)registration.waiting.postMessage({type:'ACTIVATE'});
  const worker=registration.installing||registration.waiting;
  if(worker&&worker.state!=='activated')await waitInstalled(worker);
  const active=registration.active||(await navigator.serviceWorker.ready).active;
  const info=await workerVersion(active);if(info.version!==version)throw new Error('新版缓存准备中，请稍后重试');
  report('离线已就绪',true);button.textContent='离线缓存已更新';
 }catch{report(navigator.onLine?'缓存未更新，可点菜单重试':'当前离线，使用已存版本');button.textContent='重试更新离线缓存'}finally{button.disabled=false}}
 button.addEventListener('click',refresh);
 window.addEventListener('load',refresh);
})();
