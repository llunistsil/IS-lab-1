import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { WS_CONFIG } from './humanity/models/web-socket';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    NG_EVENT_PLUGINS,
    {
      provide: WS_CONFIG,
      useValue: { url: environment.wsUrl, reconnectInterval: 3000, reconnectAttempts: 5 },
    },
  ]
};
