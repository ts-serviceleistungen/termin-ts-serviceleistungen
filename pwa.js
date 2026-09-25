let deferredInstallPrompt = null;
const installBtn = document.getElementById('installApp');
const installHelp = document.getElementById('installHelp');
const closeInstallHelp = document.getElementById('closeInstallHelp');
const installHelpText = document.getElementById('installHelpText');

function isIos(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=1').catch(()=>{}));
}

window.addEventListener('beforeinstallprompt',(event)=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  if(installBtn) installBtn.classList.remove('hidden');
});

window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  if(installBtn) installBtn.classList.add('hidden');
});

if(isStandalone() && installBtn) installBtn.classList.add('hidden');

installBtn?.addEventListener('click',async()=>{
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  if(installHelp){
    installHelpText.textContent=isIos()
      ? 'Auf dem iPhone: unten in Safari auf „Teilen“ tippen und anschließend „Zum Home-Bildschirm“ auswählen.'
      : 'Falls dein Browser keine automatische Installation anbietet, öffne das Browser-Menü und wähle „Zum Startbildschirm“ oder „App installieren“. Die genaue Bezeichnung kann je nach Browser variieren.';
    installHelp.classList.remove('hidden');
  }
});

closeInstallHelp?.addEventListener('click',()=>installHelp?.classList.add('hidden'));
installHelp?.addEventListener('click',(e)=>{if(e.target===installHelp)installHelp.classList.add('hidden')});
