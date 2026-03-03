import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of toasts; track t.id) {
        <div class="toast toast-{{ t.type }}" role="alert">
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: calc(var(--space) * 3);
      right: calc(var(--space) * 3);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space);
      max-width: 360px;
    }
    .toast {
      padding: calc(var(--space) * 2) calc(var(--space) * 3);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-primary);
      font-size: 13px;
      box-shadow: 0 1px 3px rgba(30, 41, 59, 0.08);
    }
    .toast-success { border-left: 3px solid #64748b; }
    .toast-error { border-left: 3px solid #94a3b8; }
    .toast-info { border-left: 3px solid var(--accent); }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private destroy$ = new Subject<void>();
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.toast.toasts$.pipe(takeUntil(this.destroy$)).subscribe(msg => {
      this.toasts.push(msg);
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.toasts.shift();
        this.hideTimeout = null;
      }, 4000);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }
}
