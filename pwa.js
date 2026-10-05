let deferredInstallPrompt = null;
function setupPWAInstall(){
  const buttons = [...document.querySelectorAll('#installApp, .install-app')];
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    buttons.forEach(b => b.classList.remove('hidden'));
  });
  buttons.forEach(button => button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch(e) {}
    deferredInstallPrompt = null;
    buttons.forEach(b => b.classList.add('hidden'));
  }));
  window.addEventListener('appinstalled', () => {
    buttons.forEach(b => b.classList.add('hidden'));
    deferredInstallPrompt = null;
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(err => console.warn('PWA Service Worker:', err)));
  }
}
setupPWAInstall();
