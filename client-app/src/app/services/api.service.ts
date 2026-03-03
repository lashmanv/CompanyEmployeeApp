import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

/** Base URL for the API (from ConfigService; configurable via /config.json in K8s). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  get baseUrl(): string {
    return this.config.apiUrl;
  }
  constructor(private config: ConfigService) {}
}
