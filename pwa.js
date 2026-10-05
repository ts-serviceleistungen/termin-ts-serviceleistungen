let deferredInstallPrompt = null;

function setupPWAInstall() {
  const buttons = [...document.querySelectorAll('#installApp, .install-app')];

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    buttons.forEach(button => button.classList.remove('hidden'));
  });

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } catch (error) {}
      deferredInstallPrompt = null;
      buttons.forEach(item => item.classList.add('hidden'));
    });
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    buttons.forEach(button => button.classList.add('hidden'));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(registration => registration.update())
        .catch(error => console.warn('PWA Service Worker:', error));
    });
  }
}

setupPWAInstall();
