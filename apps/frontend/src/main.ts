import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'Service Worker enregistré avec succès:',
          registration.scope,
        );
      })
      .catch((error) => {
        console.log("Échec de l'enregistrement du Service Worker:", error);
      });
  });
}
