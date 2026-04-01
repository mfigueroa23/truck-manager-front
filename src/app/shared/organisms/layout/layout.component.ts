import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../molecules/toast/toast.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-950">
      <app-sidebar [isOpen]="sidebarOpen()" (closed)="sidebarOpen.set(false)" />

      <!-- Main content -->
      <div class="md:pl-64 min-h-screen flex flex-col">
        <!-- Mobile topbar -->
        <header class="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-slate-950/90 border-b border-slate-800 backdrop-blur-sm md:hidden">
          <button
            class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            (click)="sidebarOpen.set(true)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9.5L17 7h-4v9z"/>
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-100">TruckGate IoT</span>
          </div>
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
  sidebarOpen = signal(false);
}
