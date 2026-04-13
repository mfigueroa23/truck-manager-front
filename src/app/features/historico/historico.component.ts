import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistroService } from '../../core/services/registro.service';
import { ToastService } from '../../core/services/toast.service';
import { HistoricoItem } from '../../core/models/registro.model';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';

@Component({
  selector: 'app-historico',
  imports: [FormsModule, SpinnerComponent],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-100">🕓 Histórico de Viajes</h1>
          <p class="text-sm text-slate-500 mt-0.5">Registro completo de entradas y salidas</p>
        </div>
        <button (click)="cargar()" [disabled]="loading()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
                 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors">
          <svg class="w-3.5 h-3.5" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">📦 Total viajes</p>
          <p class="text-2xl font-bold text-slate-100">{{ historico().length }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">📅 Hoy</p>
          <p class="text-2xl font-bold text-orange-400">{{ viajesHoy() }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">📅 Esta semana</p>
          <p class="text-2xl font-bold text-blue-400">{{ viajesSemana() }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">⏱ Duración media</p>
          <p class="text-2xl font-bold text-emerald-400">{{ duracionMedia() }}</p>
        </div>
      </div>

      <!-- Line charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Salidas -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-slate-200">📤 Salidas por día</p>
              <p class="text-xs text-slate-500">Últimos 14 días</p>
            </div>
            <span class="text-lg font-bold text-orange-400">{{ salidasTotal() }}</span>
          </div>
          <svg viewBox="0 0 300 100" class="w-full h-28">
            <defs>
              <linearGradient id="hGradSal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            @for (line of [0,1,2,3]; track line) {
              <line x1="0" [attr.y1]="line*25" x2="300" [attr.y2]="line*25"
                stroke="#1e293b" stroke-width="1"/>
            }
            @if (salidasLine().area) {
              <path [attr.d]="salidasLine().area" fill="url(#hGradSal)"/>
              <path [attr.d]="salidasLine().line" fill="none" stroke="#f97316" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of salidasLine().points; track $index) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="#f97316"/>
                @if (pt.val > 0) {
                  <text [attr.x]="pt.x" [attr.y]="pt.y - 6" text-anchor="middle"
                    fill="#f97316" font-size="8" font-family="sans-serif">{{ pt.val }}</text>
                }
              }
            } @else {
              <text x="150" y="55" text-anchor="middle" fill="#334155" font-size="11"
                font-family="sans-serif">Sin datos en este período</text>
            }
          </svg>
          <div class="flex justify-between mt-2">
            @for (lbl of lineLabels(); track $index) {
              @if ($index % 2 === 0) {
                <span class="text-xs text-slate-600">{{ lbl }}</span>
              }
            }
          </div>
        </div>

        <!-- Entradas -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-slate-200">📥 Entradas por día</p>
              <p class="text-xs text-slate-500">Últimos 14 días</p>
            </div>
            <span class="text-lg font-bold text-blue-400">{{ entradasTotal() }}</span>
          </div>
          <svg viewBox="0 0 300 100" class="w-full h-28">
            <defs>
              <linearGradient id="hGradEnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
              </linearGradient>
            </defs>
            @for (line of [0,1,2,3]; track line) {
              <line x1="0" [attr.y1]="line*25" x2="300" [attr.y2]="line*25"
                stroke="#1e293b" stroke-width="1"/>
            }
            @if (entradasLine().area) {
              <path [attr.d]="entradasLine().area" fill="url(#hGradEnt)"/>
              <path [attr.d]="entradasLine().line" fill="none" stroke="#3b82f6" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of entradasLine().points; track $index) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="#3b82f6"/>
                @if (pt.val > 0) {
                  <text [attr.x]="pt.x" [attr.y]="pt.y - 6" text-anchor="middle"
                    fill="#3b82f6" font-size="8" font-family="sans-serif">{{ pt.val }}</text>
                }
              }
            } @else {
              <text x="150" y="55" text-anchor="middle" fill="#334155" font-size="11"
                font-family="sans-serif">Sin datos en este período</text>
            }
          </svg>
          <div class="flex justify-between mt-2">
            @for (lbl of lineLabels(); track $index) {
              @if ($index % 2 === 0) {
                <span class="text-xs text-slate-600">{{ lbl }}</span>
              }
            }
          </div>
        </div>
      </div>

      <!-- Search & filter -->
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text" [(ngModel)]="busqueda"
            placeholder="Buscar por patente, conductor o empresa..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm
                   text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2
                   focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"/>
        </div>
        <input type="date" [(ngModel)]="fechaDesde"
          class="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"/>
        <input type="date" [(ngModel)]="fechaHasta"
          class="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"/>
      </div>

      <!-- Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-sm font-medium text-slate-200">Viajes completados</h2>
          <div class="flex items-center gap-3">
            @if (loading()) { <app-spinner size="sm" class="text-slate-500"/> }
            <span class="text-xs text-slate-500">{{ filtrados().length }} registro{{ filtrados().length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        @if (loading() && historico().length === 0) {
          <div class="flex items-center justify-center py-16">
            <app-spinner size="lg" class="text-orange-500"/>
          </div>
        } @else if (filtrados().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <p class="text-sm font-medium text-slate-400">Sin resultados</p>
            <p class="text-xs text-slate-600 mt-1">Ajusta los filtros o espera a que se completen viajes</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Patente</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Conductor</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Salida</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Entrada</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Duración</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (h of filtrados(); track h.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3.5">
                      <span class="text-xs text-slate-600 font-mono">#{{ h.id }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <span class="font-mono font-medium text-orange-400">{{ h.patente }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <div>
                        <p class="text-slate-200 font-medium">{{ h.conductor.nombre }}</p>
                        <p class="text-xs text-slate-500 font-mono">{{ h.conductor.rut }}</p>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 hidden md:table-cell">
                      <span class="text-slate-300">{{ h.empresa }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden sm:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ formatDate(h.salidaAt) }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden sm:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ formatDate(h.entradaAt) }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <span class="text-emerald-400 text-xs font-mono font-medium">{{ duracion(h.salidaAt, h.entradaAt) }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

    </div>
  `
})
export class HistoricoComponent implements OnInit {
  private registroService = inject(RegistroService);
  private toastService    = inject(ToastService);

  historico = signal<HistoricoItem[]>([]);
  loading   = signal(false);
  busqueda  = '';
  fechaDesde = '';
  fechaHasta = '';

  // ── Stats ──────────────────────────────────────────────────
  viajesHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return this.historico().filter(h => h.salidaAt.startsWith(hoy)).length;
  });

  viajesSemana = computed(() => {
    const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7);
    return this.historico().filter(h => new Date(h.salidaAt) >= hace7).length;
  });

  duracionMedia = computed(() => {
    const items = this.historico();
    if (items.length === 0) return '—';
    const total = items.reduce((acc, h) =>
      acc + (new Date(h.entradaAt).getTime() - new Date(h.salidaAt).getTime()), 0);
    const avgMs = total / items.length;
    const h = Math.floor(avgMs / 3_600_000);
    const m = Math.floor((avgMs % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  });

  filtrados = computed(() => {
    let items = this.historico();
    const q = this.busqueda.toLowerCase();
    if (q) items = items.filter(h =>
      h.patente.toLowerCase().includes(q) ||
      h.conductor.nombre.toLowerCase().includes(q) ||
      h.conductor.rut.toLowerCase().includes(q) ||
      h.empresa.toLowerCase().includes(q)
    );
    if (this.fechaDesde) items = items.filter(h => h.salidaAt >= this.fechaDesde);
    if (this.fechaHasta) items = items.filter(h => h.salidaAt <= this.fechaHasta + 'T23:59:59');
    return items;
  });

  // ── Charts ─────────────────────────────────────────────────
  lineLabels = computed(() => {
    const labels: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return labels;
  });

  salidasTotal  = computed(() => this.salidasLine().points.reduce((a, p) => a + p.val, 0));
  entradasTotal = computed(() => this.entradasLine().points.reduce((a, p) => a + p.val, 0));
  salidasLine   = computed(() => this.buildLine(this.historico(), 'salidaAt'));
  entradasLine  = computed(() => this.buildLine(this.historico(), 'entradaAt'));

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.registroService.getHistorico().subscribe({
      next:  data => { this.historico.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar histórico', 'error'); }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  duracion(salida: string, entrada: string): string {
    const ms = new Date(entrada).getTime() - new Date(salida).getTime();
    const h  = Math.floor(ms / 3_600_000);
    const m  = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  private buildLine(items: HistoricoItem[], field: 'salidaAt' | 'entradaAt') {
    const W = 300, H = 92, PAD = 8;
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const counts = days.map(day =>
      items.filter(h => new Date(h[field]).toISOString().split('T')[0] === day).length
    );
    const max = Math.max(...counts, 1);
    const n   = counts.length;
    const pts = counts.map((val, i) => ({
      x:   n > 1 ? (i / (n - 1)) * W : W / 2,
      y:   PAD + (H - PAD) - (val / max) * (H - PAD),
      val,
    }));

    if (counts.every(c => c === 0)) return { line: '', area: '', points: pts };

    const linePts = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area    = `${linePts} L ${pts[pts.length-1].x.toFixed(1)} ${H} L 0 ${H} Z`;
    return { line: linePts, area, points: pts };
  }
}
