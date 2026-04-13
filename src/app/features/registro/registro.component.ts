import {
  Component, inject, signal, computed,
  OnInit, OnDestroy, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistroService } from '../../core/services/registro.service';
import { ToastService } from '../../core/services/toast.service';
import { RegistroView, HistoricoItem } from '../../core/models/registro.model';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, BadgeComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-100">📋 Registro de Accesos</h1>
          <p class="text-sm text-slate-500 mt-0.5">Control en tiempo real del estado de los camiones</p>
        </div>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
                 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
          (click)="cargar()" [disabled]="loading()">
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
          <p class="text-xs text-slate-500 mb-1">🚛 Total Camiones</p>
          <p class="text-2xl font-bold text-slate-100">{{ registros().length }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">🟠 En Reparto</p>
          <p class="text-2xl font-bold text-amber-400">{{ enReparto() }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">🟢 Disponibles</p>
          <p class="text-2xl font-bold text-emerald-400">{{ disponibles() }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">📊 Viajes totales</p>
          <p class="text-2xl font-bold text-blue-400">{{ historico().length }}</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <!-- Donut: disponible vs reparto -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p class="text-xs font-medium text-slate-400 mb-3">Estado de la flota</p>
          <div class="flex items-center gap-4">
            <div class="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" class="w-full h-full">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" stroke-width="12"/>
                @if (registros().length > 0) {
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" stroke-width="12"
                    transform="rotate(-90 50 50)"
                    [attr.stroke-dasharray]="donut().dispArr"
                    stroke-dashoffset="0"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" stroke-width="12"
                    transform="rotate(-90 50 50)"
                    [attr.stroke-dasharray]="donut().repArr"
                    [attr.stroke-dashoffset]="donut().repOffset"/>
                }
                <text x="50" y="46" text-anchor="middle" fill="#e2e8f0" font-size="16" font-weight="700"
                  font-family="sans-serif">{{ registros().length }}</text>
                <text x="50" y="59" text-anchor="middle" fill="#64748b" font-size="8"
                  font-family="sans-serif">camiones</text>
              </svg>
            </div>
            <div class="space-y-2 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500">Disponibles</p>
                  <p class="text-sm font-bold text-emerald-400">{{ disponibles() }} <span class="text-xs text-slate-500 font-normal">({{ donut().dispPct }}%)</span></p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                <div class="min-w-0">
                  <p class="text-xs text-slate-500">En reparto</p>
                  <p class="text-sm font-bold text-amber-400">{{ enReparto() }} <span class="text-xs text-slate-500 font-normal">({{ donut().repPct }}%)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bar: por modelo -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p class="text-xs font-medium text-slate-400 mb-3">Camiones por modelo</p>
          @if (barData().length === 0) {
            <div class="flex items-center justify-center h-20 text-xs text-slate-600">Sin datos</div>
          } @else {
            <div class="space-y-2">
              @for (item of barData(); track item.label) {
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 w-20 truncate shrink-0" [title]="item.label">{{ item.label }}</span>
                  <div class="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                      [style.width.%]="(item.count / barMax()) * 100"></div>
                  </div>
                  <span class="text-xs font-bold text-slate-300 w-4 text-right shrink-0">{{ item.count }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Line: salidas -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-slate-400">Salidas (14 días)</p>
            <span class="text-sm font-bold text-orange-400">{{ salidasTotal() }}</span>
          </div>
          <svg viewBox="0 0 260 70" preserveAspectRatio="none" class="w-full h-14">
            <defs>
              <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
              </linearGradient>
            </defs>
            @if (salidasLine().area) {
              <path [attr.d]="salidasLine().area" fill="url(#gradSalidas)"/>
              <path [attr.d]="salidasLine().line" fill="none" stroke="#f97316" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of salidasLine().points; track $index) {
                @if (pt.val > 0) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.5" fill="#f97316"/>
                }
              }
            }
          </svg>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-slate-600">{{ lineLabels()[0] }}</span>
            <span class="text-xs text-slate-600">{{ lineLabels()[13] }}</span>
          </div>
        </div>

        <!-- Line: entradas -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-slate-400">Entradas (14 días)</p>
            <span class="text-sm font-bold text-blue-400">{{ entradasTotal() }}</span>
          </div>
          <svg viewBox="0 0 260 70" preserveAspectRatio="none" class="w-full h-14">
            <defs>
              <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
              </linearGradient>
            </defs>
            @if (entradasLine().area) {
              <path [attr.d]="entradasLine().area" fill="url(#gradEntradas)"/>
              <path [attr.d]="entradasLine().line" fill="none" stroke="#3b82f6" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of entradasLine().points; track $index) {
                @if (pt.val > 0) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.5" fill="#3b82f6"/>
                }
              }
            }
          </svg>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-slate-600">{{ lineLabels()[0] }}</span>
            <span class="text-xs text-slate-600">{{ lineLabels()[13] }}</span>
          </div>
        </div>
      </div>

      <!-- RFID Scanner -->
      <div class="bg-slate-900 border border-orange-500/20 rounded-2xl p-5 glow-orange">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h4M15 8h.01M15 8H9m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-200">📡 Lector RFID</p>
            <p class="text-xs text-slate-500">Ingresa o escanea el código RFID del camión</p>
          </div>
        </div>
        <form (ngSubmit)="registrar()" class="flex gap-2">
          <input type="text" [(ngModel)]="rfidInput" name="rfid"
            placeholder="Código RFID del camión..."
            class="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                   placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2
                   focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            [disabled]="registrando()"/>
          <app-button type="submit" variant="primary" size="md"
            [loading]="registrando()" [disabled]="!rfidInput.trim()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Registrar
          </app-button>
        </form>
      </div>

      <!-- Fleet table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-sm font-medium text-slate-200">🗂️ Estado actual de la flota</h2>
          @if (loading()) { <app-spinner size="sm" class="text-slate-500"/> }
        </div>
        @if (loading() && registros().length === 0) {
          <div class="flex items-center justify-center py-16">
            <div class="text-center">
              <app-spinner size="lg" class="text-orange-500 mx-auto mb-3"/>
              <p class="text-sm text-slate-500">Cargando registros...</p>
            </div>
          </div>
        } @else if (registros().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center px-4">
            <p class="text-sm font-medium text-slate-400">Sin registros</p>
            <p class="text-xs text-slate-600 mt-1">No hay camiones registrados en el sistema</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Patente</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Conductor</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Carga</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Salida</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Ingreso</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (reg of registros(); track reg.patente) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3.5">
                      <div>
                        <span class="font-mono text-sm font-medium text-orange-400">{{ reg.patente }}</span>
                        <p class="text-xs text-slate-600 hidden sm:block">{{ reg.marca }} {{ reg.modelo }}</p>
                      </div>
                    </td>
                    <td class="px-5 py-3.5">
                      @if (reg.conductor) {
                        <div>
                          <p class="text-slate-200 font-medium">{{ reg.conductor.nombre }}</p>
                          <p class="text-xs text-slate-500 font-mono">{{ reg.conductor.rut }}</p>
                        </div>
                      } @else {
                        <span class="text-slate-600 text-xs">Sin conductor</span>
                      }
                    </td>
                    <td class="px-5 py-3.5 hidden md:table-cell">
                      <span class="text-slate-300">{{ reg.empresa || '—' }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs">{{ reg.tipoCarga || '—' }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ reg.salida ? formatDate(reg.salida) : '—' }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ reg.ingreso ? formatDate(reg.ingreso) : '—' }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <app-badge [variant]="reg.estado === 'Disponible' ? 'success' : 'warning'">
                        {{ reg.estado }}
                      </app-badge>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Historico section -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-medium text-slate-200">🕓 Histórico reciente</h2>
            <p class="text-xs text-slate-500 mt-0.5">Últimos {{ historicoReciente().length }} viajes completados</p>
          </div>
          @if (loadingHistorico()) { <app-spinner size="sm" class="text-slate-500"/> }
        </div>
        @if (historicoReciente().length === 0 && !loadingHistorico()) {
          <div class="flex flex-col items-center justify-center py-10 text-center px-4">
            <p class="text-sm font-medium text-slate-400">Sin viajes registrados</p>
            <p class="text-xs text-slate-600 mt-1">Aquí aparecerán los viajes completados (salida + entrada)</p>
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
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Salida</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Entrada</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Duración</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (h of historicoReciente(); track h.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3.5">
                      <span class="text-xs text-slate-600 font-mono">#{{ h.id }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <span class="font-mono text-sm font-medium text-orange-400">{{ h.patente }}</span>
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
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ formatDate(h.salidaAt) }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs font-mono">{{ formatDate(h.entradaAt) }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-emerald-400 text-xs font-mono">{{ duracion(h.salidaAt, h.entradaAt) }}</span>
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
export class RegistroComponent implements OnInit, OnDestroy {
  private registroService = inject(RegistroService);
  private toastService    = inject(ToastService);

  registros        = signal<RegistroView[]>([]);
  historico        = signal<HistoricoItem[]>([]);
  loading          = signal(false);
  loadingHistorico = signal(false);
  registrando      = signal(false);
  rfidInput        = '';

  private refreshInterval?: ReturnType<typeof setInterval>;

  // ── Stats ──────────────────────────────────────────────────
  enReparto    = computed(() => this.registros().filter(r => r.estado === 'Reparto').length);
  disponibles  = computed(() => this.registros().filter(r => r.estado === 'Disponible').length);

  // ── Historico table (last 15) ───────────────────────────────
  historicoReciente = computed(() => this.historico().slice(0, 15));

  // ── Donut chart ─────────────────────────────────────────────
  donut = computed(() => {
    const r = 38, circ = 2 * Math.PI * r;
    const total = this.registros().length;
    if (total === 0) return { dispArr: `0 ${circ}`, repArr: `0 ${circ}`, repOffset: 0, dispPct: 0, repPct: 0 };
    const disp = this.disponibles();
    const rep  = this.enReparto();
    const dLen = (disp / total) * circ;
    const rLen = (rep  / total) * circ;
    return {
      dispArr:  `${dLen.toFixed(2)} ${(circ - dLen).toFixed(2)}`,
      repArr:   `${rLen.toFixed(2)} ${(circ - rLen).toFixed(2)}`,
      repOffset: -dLen,
      dispPct:  Math.round((disp / total) * 100),
      repPct:   Math.round((rep  / total) * 100),
    };
  });

  // ── Bar chart (by model) ────────────────────────────────────
  barData = computed(() => {
    const groups: Record<string, number> = {};
    this.registros().forEach(r => {
      const key = r.modelo ? `${r.marca} ${r.modelo}` : (r.marca || 'Sin modelo');
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  });

  barMax = computed(() => Math.max(...this.barData().map(d => d.count), 1));

  // ── Line charts ─────────────────────────────────────────────
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

  salidasLine  = computed(() => this.buildLine(this.historico(), 'salidaAt'));
  entradasLine = computed(() => this.buildLine(this.historico(), 'entradaAt'));

  // ── Lifecycle ───────────────────────────────────────────────
  ngOnInit() {
    this.cargar();
    this.refreshInterval = setInterval(() => this.cargar(), 30_000);
  }

  ngOnDestroy() { if (this.refreshInterval) clearInterval(this.refreshInterval); }

  cargar() {
    this.loading.set(true);
    this.loadingHistorico.set(true);
    this.registroService.getAll().subscribe({
      next:  data => { this.registros.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar registros', 'error'); }
    });
    this.registroService.getHistorico().subscribe({
      next:  data => { this.historico.set(data); this.loadingHistorico.set(false); },
      error: ()   => { this.loadingHistorico.set(false); }
    });
  }

  registrar() {
    const rfid = this.rfidInput.trim();
    if (!rfid) return;
    this.registrando.set(true);
    this.registroService.registrarAcceso(rfid).subscribe({
      next: (res) => {
        this.toastService.show(`${res.entradaAt ? 'Entrada' : 'Salida'} registrada correctamente`, 'success');
        this.rfidInput = '';
        this.registrando.set(false);
        this.cargar();
      },
      error: (err) => {
        this.toastService.show(this.parseError(err), 'error');
        this.registrando.set(false);
      }
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

  // ── Chart helpers ────────────────────────────────────────────
  private buildLine(items: HistoricoItem[], field: 'salidaAt' | 'entradaAt') {
    const W = 260, H = 62, PAD = 4;
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

  private parseError(err: any): string {
    const s = err?.status;
    if (s === 404) return 'Camión no encontrado para ese RFID';
    if (s === 409) return 'No hay registro de salida abierto para cerrar';
    if (s === 429) return 'Tiempo mínimo entre registros no cumplido';
    if (s === 400) return 'RFID no válido';
    return err?.error?.message ?? 'Error al registrar acceso';
  }
}
