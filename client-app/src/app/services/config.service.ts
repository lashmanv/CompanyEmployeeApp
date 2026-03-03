import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AppConfig {
  apiUrl: string;
}

const defaultConfig: AppConfig = {
  apiUrl: 'http://localhost:5297/api'
};

/**
 * Runtime config loaded from /config.json (e.g. from Kubernetes ConfigMap).
 * Stateless; safe for horizontal scaling.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _config: AppConfig = defaultConfig;
  private loaded = false;

  get config(): AppConfig {
    return this._config;
  }

  get apiUrl(): string {
    return this._config.apiUrl;
  }

  constructor(private http: HttpClient) {}

  load(): Promise<AppConfig> {
    if (this.loaded) return Promise.resolve(this._config);
    return firstValueFrom(
      this.http.get<AppConfig>('/config.json').pipe(
        catchError(() => of(null))
      )
    ).then(c => {
      if (c?.apiUrl) this._config = { apiUrl: c.apiUrl };
      this.loaded = true;
      return this._config;
    });
  }
}
