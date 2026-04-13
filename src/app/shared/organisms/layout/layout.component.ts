import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../molecules/toast/toast.component';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <app-sidebar [isOpen]="sidebarOpen()" (closed)="sidebarOpen.set(false)" />

      <!-- Main content -->
      <div class="md:pl-64 min-h-screen flex flex-col">
        <!-- Mobile topbar -->
        <header class="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm md:hidden">
          <button
            class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            (click)="sidebarOpen.set(true)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex items-center gap-2 flex-1">
            <div class="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9.5L17 7h-4v9z"/>
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">TruckGate IoT</span>
          </div>
          <!-- Theme toggle (mobile) -->
          <button
            (click)="themeService.toggle()"
            title="{{ themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro' }}"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            @if (themeService.isDark()) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            }
          </button>
        </header>

        <main class="flex-1 p-4 md:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast />
  `
})
export class LayoutComponent {
  sidebarOpen  = signal(false);
  themeService = inject(ThemeService);
}
