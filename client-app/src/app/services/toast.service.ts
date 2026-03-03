import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private subject = new Subject<ToastMessage>();
  toasts$ = this.subject.asObservable();

  show(message: string, type: ToastType = 'info'): void {
    this.subject.next({ id: this.nextId++, message, type });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
}
