import { Injectable } from '@angular/core';

/** Base URL for the .NET API (OOP learning backend). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = 'http://localhost:5297/api';
}
