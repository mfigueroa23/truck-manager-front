import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RegistroService } from '../../core/services/registro.service';
import { CamionService } from '../../core/services/camion.service';
import { ToastService } from '../../core/services/toast.service';
import { RegistroView, HistoricoItem } from '../../core/models/registro.model';
import { Camion } from '../../core/models/camion.model';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';

@Component({
  selector: 'app-graficos',
  imports: [SpinnerComponent],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">📊 Gráficos</h1>
          <p class="text-sm text-slate-500 mt-0.5">Análisis visual de la flota e histórico de operaciones</p>
        </div>
        <button (click)="cargar()" [disabled]="loading()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors">
          <svg class="w-3.5 h-3.5" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Row 1: Donut + Bar -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Donut -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">🚛 Estado de la flota</h2>
          <p class="text-xs text-slate-500 mb-5">Distribución disponible vs. en reparto</p>

          @if (loading()) {
            <div class="flex justify-center py-10"><app-spinner size="lg" class="text-orange-500"/></div>
          } @else {
            <div class="flex flex-col sm:flex-row items-center gap-8">
              <!-- SVG donut -->
              <div class="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 100 100" class="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="12"/>
                  @if (registros().length > 0) {
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="12"
                      transform="rotate(-90 50 50)"
                      [attr.stroke-dasharray]="donut().dispArr"
                      stroke-dashoffset="0"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" stroke-width="12"
                      transform="rotate(-90 50 50)"
                      [attr.stroke-dasharray]="donut().repArr"
                      [attr.stroke-dashoffset]="donut().repOffset"/>
                  }
                  <text x="50" y="46" text-anchor="middle" class="fill-slate-800 dark:fill-slate-200" font-size="18" font-weight="700"
                    font-family="sans-serif">{{ registros().length }}</text>
                  <text x="50" y="60" text-anchor="middle" fill="#64748b" font-size="8"
                    font-family="sans-serif">camiones</text>
                </svg>
              </div>
              <!-- Legend -->
              <div class="space-y-4 w-full">
                <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span class="text-sm text-slate-600 dark:text-slate-300">Disponibles</span>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-emerald-400">{{ disponibles() }}</p>
                    <p class="text-xs text-slate-500">{{ donut().dispPct }}%</p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span class="text-sm text-slate-600 dark:text-slate-300">En reparto</span>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-amber-400">{{ enReparto() }}</p>
                    <p class="text-xs text-slate-500">{{ donut().repPct }}%</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Horizontal bar: por modelo -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">🚚 Distribución por modelo</h2>
          <p class="text-xs text-slate-500 mb-5">Cantidad de unidades por marca y modelo</p>

          @if (loading()) {
            <div class="flex justify-center py-10"><app-spinner size="lg" class="text-orange-500"/></div>
          } @else if (barData().length === 0) {
            <div class="flex items-center justify-center h-40 text-sm text-slate-400 dark:text-slate-600">Sin datos de camiones</div>
          } @else {
            <div class="space-y-3">
              @for (item of barData(); track item.label) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-45" [title]="item.label">
                      {{ item.label }}
                    </span>
                    <span class="text-xs font-bold text-orange-400 ml-2 shrink-0">{{ item.count }}</span>
                  </div>
                  <div class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      [style.width.%]="(item.count / barMax()) * 100"
                      [style.background]="barColor($index)"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Row 2: Line charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Salidas line -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">📤 Salidas por día</h2>
              <p class="text-xs text-slate-500">Histórico de los últimos 30 días</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-orange-400">{{ salidasTotal() }}</p>
              <p class="text-xs text-slate-500">total</p>
            </div>
          </div>
          @if (loading()) {
            <div class="flex justify-center py-10"><app-spinner size="lg" class="text-orange-500"/></div>
          } @else {
            <svg viewBox="0 0 360 120" class="w-full h-36">
              <defs>
                <linearGradient id="gGradSal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                </linearGradient>
              </defs>
              @for (i of [0,1,2,3,4]; track i) {
                <line x1="0" [attr.y1]="i * 24" x2="360" [attr.y2]="i * 24"
                  class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1"/>
              }
              @if (salidasLine30().area) {
                <path [attr.d]="salidasLine30().area" fill="url(#gGradSal)"/>
                <path [attr.d]="salidasLine30().line" fill="none" stroke="#f97316" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
                @for (pt of salidasLine30().points; track $index) {
                  @if (pt.val > 0) {
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#f97316"/>
                    <text [attr.x]="pt.x" [attr.y]="pt.y - 7" text-anchor="middle"
                      fill="#fb923c" font-size="8" font-family="sans-serif">{{ pt.val }}</text>
                  }
                }
              } @else {
                <text x="180" y="65" text-anchor="middle" class="fill-slate-300 dark:fill-slate-700" font-size="12"
                  font-family="sans-serif">Sin datos en este período</text>
              }
            </svg>
            <div class="flex justify-between mt-2">
              <span class="text-xs text-slate-400 dark:text-slate-600">{{ lineLabels30()[0] }}</span>
              <span class="text-xs text-slate-500">últimos 30 días</span>
              <span class="text-xs text-slate-400 dark:text-slate-600">{{ lineLabels30()[29] }}</span>
            </div>
          }
        </div>

        <!-- Entradas line -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">📥 Entradas por día</h2>
              <p class="text-xs text-slate-500">Histórico de los últimos 30 días</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-400">{{ entradasTotal() }}</p>
              <p class="text-xs text-slate-500">total</p>
            </div>
          </div>
          @if (loading()) {
            <div class="flex justify-center py-10"><app-spinner size="lg" class="text-orange-500"/></div>
          } @else {
            <svg viewBox="0 0 360 120" class="w-full h-36">
              <defs>
                <linearGradient id="gGradEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
              </defs>
              @for (i of [0,1,2,3,4]; track i) {
                <line x1="0" [attr.y1]="i * 24" x2="360" [attr.y2]="i * 24"
                  class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1"/>
              }
              @if (entradasLine30().area) {
                <path [attr.d]="entradasLine30().area" fill="url(#gGradEnt)"/>
                <path [attr.d]="entradasLine30().line" fill="none" stroke="#3b82f6" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
                @for (pt of entradasLine30().points; track $index) {
                  @if (pt.val > 0) {
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#3b82f6"/>
                    <text [attr.x]="pt.x" [attr.y]="pt.y - 7" text-anchor="middle"
                      fill="#60a5fa" font-size="8" font-family="sans-serif">{{ pt.val }}</text>
                  }
                }
              } @else {
                <text x="180" y="65" text-anchor="middle" class="fill-slate-300 dark:fill-slate-700" font-size="12"
                  font-family="sans-serif">Sin datos en este período</text>
              }
            </svg>
            <div class="flex justify-between mt-2">
              <span class="text-xs text-slate-400 dark:text-slate-600">{{ lineLabels30()[0] }}</span>
              <span class="text-xs text-slate-500">últimos 30 días</span>
              <span class="text-xs text-slate-400 dark:text-slate-600">{{ lineLabels30()[29] }}</span>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class GraficosComponent implements OnInit {
  private registroService = inject(RegistroService);
  private camionService   = inject(CamionService);
  private toastService    = inject(ToastService);

  registros = signal<RegistroView[]>([]);
  camiones  = signal<Camion[]>([]);
  historico = signal<HistoricoItem[]>([]);
  loading   = signal(false);

  enReparto   = computed(() => this.registros().filter(r => r.estado === 'Reparto').length);
  disponibles = computed(() => this.registros().filter(r => r.estado === 'Disponible').length);

  donut = computed(() => {
    const r = 40, circ = 2 * Math.PI * r;
    const total = this.registros().length;
    if (total === 0) return { dispArr: `0 ${circ}`, repArr: `0 ${circ}`, repOffset: 0, dispPct: 0, repPct: 0 };
    const disp = this.disponibles(), rep = this.enReparto();
    const dLen = (disp / total) * circ, rLen = (rep / total) * circ;
    return {
      dispArr:   `${dLen.toFixed(2)} ${(circ - dLen).toFixed(2)}`,
      repArr:    `${rLen.toFixed(2)} ${(circ - rLen).toFixed(2)}`,
      repOffset: -dLen,
      dispPct:   Math.round((disp / total) * 100),
      repPct:    Math.round((rep  / total) * 100),
    };
  });

  barData = computed(() => {
    const groups: Record<string, number> = {};
    this.camiones().forEach(c => {
      const key = c.modelo ? `${c.marca} ${c.modelo}` : (c.marca || 'Sin modelo');
      groups[key] = (groups[key] || 0) + 1;
    });
    if (this.camiones().length === 0) {
      this.registros().forEach(r => {
        const key = r.modelo ? `${r.marca} ${r.modelo}` : (r.marca || 'Sin modelo');
        groups[key] = (groups[key] || 0) + 1;
      });
    }
    return Object.entries(groups)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  });

  barMax = computed(() => Math.max(...this.barData().map(d => d.count), 1));

  barColor(index: number): string {
    const colors = ['#f97316','#3b82f6','#10b981','#a78bfa','#f43f5e','#facc15','#06b6d4','#84cc16'];
    return colors[index % colors.length];
  }

  lineLabels30 = computed(() => {
    const labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return labels;
  });

  salidasTotal  = computed(() => this.salidasLine30().points.reduce((a, p) => a + p.val, 0));
  entradasTotal = computed(() => this.entradasLine30().points.reduce((a, p) => a + p.val, 0));
  salidasLine30  = computed(() => this.buildLine(this.historico(), 'salidaAt',  30, 360, 112));
  entradasLine30 = computed(() => this.buildLine(this.historico(), 'entradaAt', 30, 360, 112));

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    let done = 0;
    const check = () => { if (++done === 3) this.loading.set(false); };

    this.registroService.getAll().subscribe({
      next: data => { this.registros.set(data); check(); },
      error: ()  => { check(); this.toastService.show('Error al cargar datos', 'error'); }
    });
    this.registroService.getHistorico().subscribe({
      next: data => { this.historico.set(data); check(); },
      error: ()  => { check(); }
    });
    this.camionService.getAll().subscribe({
      next: data => { this.camiones.set(data); check(); },
      error: ()  => { check(); }
    });
  }

  private buildLine(
    items: HistoricoItem[], field: 'salidaAt' | 'entradaAt',
    nDays: number, W: number, H: number
  ) {
    const PAD = 8;
    const days: string[] = [];
    for (let i = nDays - 1; i >= 0; i--) {
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
