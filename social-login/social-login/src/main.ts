import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import {
  SocialAuthServiceConfig,
  GoogleLoginProvider
} from '@abacritt/angularx-social-login';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "426702860833-eqe6uhptoscngjdksh8fborsblqqfsbi.apps.googleusercontent.com"
            )
          }
        ]
      } as SocialAuthServiceConfig
    }
  ]
});
