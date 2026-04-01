import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile overlay -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
        (click)="closed.emit()"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800
             flex flex-col transition-transform duration-300 ease-in-out"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
      [class.md:translate-x-0]="true"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div class="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9.5L17 7h-4v9z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-100 leading-none">TruckGate</p>
          <p class="text-xs text-slate-500 mt-0.5">IoT Control de Acceso</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p class="px-2 mb-2 text-xs font-medium text-slate-600 uppercase tracking-wider">Módulos</p>
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-orange-500/10 text-orange-400 border-orange-500/30"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400
                   hover:bg-slate-800 hover:text-slate-200 transition-all duration-150
                   border border-transparent group"
            (click)="closed.emit()"
          >
            <span class="w-5 h-5 flex-shrink-0" [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="px-4 py-4 border-t border-slate-800">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></span>
          <span class="text-xs text-slate-500">API conectada</span>
        </div>
        <p class="text-xs text-slate-600 mt-1">api-truckmanager.devsonic.cl</p>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  isOpen = input(false);
  closed = output<void>();

  navItems: NavItem[] = [
    {
      label: '📋 Registro',
      route: '/registro',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
             </svg>`
    },
    {
      label: '🏢 Empresas',
      route: '/empresas',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
             </svg>`
    },
    {
      label: '👤 Conductores',
      route: '/conductores',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
             </svg>`
    },
    {
      label: '🚛 Camiones',
      route: '/camiones',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9.5L17 7h-4v9z"/>
             </svg>`
    },
  ];
}
