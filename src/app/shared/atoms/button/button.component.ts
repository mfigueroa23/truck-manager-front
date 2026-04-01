import { Component, input, output, computed } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [SpinnerComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <app-spinner size="sm" />
      }
      <ng-content />
    </button>
  `
})
export class ButtonComponent {
  variant  = input<ButtonVariant>('primary');
  size     = input<ButtonSize>('md');
  loading  = input(false);
  disabled = input(false);
  type     = input<'button' | 'submit' | 'reset'>('button');
  clicked  = output<MouseEvent>();

  classes = computed(() => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<ButtonVariant, string> = {
      primary:   'bg-orange-500 hover:bg-orange-400 text-white focus:ring-orange-500 shadow-sm',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
      danger:    'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
      ghost:     'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus:ring-slate-500',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });
}
