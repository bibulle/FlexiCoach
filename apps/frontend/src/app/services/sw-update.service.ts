import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwUpdateService {
  public updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();
  private registration: ServiceWorkerRegistration | null = null;

  checkForUpdates(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        this.registration = reg;

        // Vérifier immédiatement
        reg.update();

        // Écouter les nouvelles mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                this.updateAvailableSubject.next(true);
              }
            });
          }
        });
      });

      // Écouter le changement de contrôleur (quand le nouveau SW prend le contrôle).
      // Lors de la toute première installation, le SW prend le contrôle d'une page
      // qui n'en avait pas (clients.claim) : ce n'est pas une mise à jour, on ne
      // recharge pas (sinon la saisie en cours, ex. formulaire d'inscription, est perdue).
      let refreshing = false;
      let currentController = navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        const previousController = currentController;
        currentController = navigator.serviceWorker.controller;
        if (previousController && !refreshing) {
          refreshing = true;
          this.reloadPage();
        }
      });
    }
  }

  /** Recharge la page (isolé pour pouvoir être espionné dans les tests). */
  protected reloadPage(): void {
    window.location.reload();
  }

  applyUpdate(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}
