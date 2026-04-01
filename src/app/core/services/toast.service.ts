import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Date.now();
    this.toasts.update(ts => [...ts, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
