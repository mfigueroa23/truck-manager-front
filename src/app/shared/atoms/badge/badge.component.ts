import { Component, input, computed } from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  template: `
    <span [class]="classes()" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      <ng-content />
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');

  classes = computed(() => {
    const map: Record<BadgeVariant, string> = {
      success: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
      danger:  'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
      info:    'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
      neutral: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
    };
    return map[this.variant()];
  });

  dotClass = computed(() => {
    const map: Record<BadgeVariant, string> = {
      success: 'bg-emerald-400',
      warning: 'bg-amber-400',
      danger:  'bg-red-400',
      info:    'bg-blue-400',
      neutral: 'bg-slate-400',
    };
    return map[this.variant()];
  });
}
