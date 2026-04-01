import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistroService } from '../../core/services/registro.service';
import { ToastService } from '../../core/services/toast.service';
import { RegistroView } from '../../core/models/registro.model';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, BadgeComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-100">📋 Registro de Accesos</h1>
          <p class="text-sm text-slate-500 mt-0.5">Control en tiempo real del estado de los camiones</p>
        </div>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
                 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
          (click)="cargar()"
          [disabled]="loading()"
        >
          <svg class="w-3.5 h-3.5" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Stats row -->
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
          <p class="text-xs text-slate-500 mb-1">⚠️ Sin conductor</p>
          <p class="text-2xl font-bold text-slate-500">{{ sinConductor() }}</p>
        </div>
      </div>

      <!-- RFID scanner -->
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
            <p class="text-xs text-slate-500">Ingresa o escanea el código RFID del conductor</p>
          </div>
        </div>

        <form (ngSubmit)="registrar()" class="flex gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              [(ngModel)]="rfidInput"
              name="rfid"
              placeholder="Código RFID del conductor..."
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm
                     focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                     transition-all duration-150"
              [disabled]="registrando()"
            />
          </div>
          <app-button
            type="submit"
            variant="primary"
            size="md"
            [loading]="registrando()"
            [disabled]="!rfidInput.trim()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Registrar
          </app-button>
        </form>
      </div>

      <!-- Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-sm font-medium text-slate-200">🗂️ Estado actual de la flota</h2>
          @if (loading()) {
            <app-spinner size="sm" class="text-slate-500" />
          }
        </div>

        @if (loading() && registros().length === 0) {
          <div class="flex items-center justify-center py-16">
            <div class="text-center">
              <app-spinner size="lg" class="text-orange-500 mx-auto mb-3" />
              <p class="text-sm text-slate-500">Cargando registros...</p>
            </div>
          </div>
        } @else if (registros().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center px-4">
            <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
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
                      <span class="font-mono text-sm font-medium text-orange-400">{{ reg.patente }}</span>
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
                      <span class="text-slate-400 text-xs font-mono">
                        {{ reg.salida ? formatDate(reg.salida) : '—' }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      <span class="text-slate-400 text-xs font-mono">
                        {{ reg.ingreso ? formatDate(reg.ingreso) : '—' }}
                      </span>
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
    </div>
  `
})
export class RegistroComponent implements OnInit, OnDestroy {
  private registroService = inject(RegistroService);
  private toastService    = inject(ToastService);

  registros  = signal<RegistroView[]>([]);
  loading    = signal(false);
  registrando = signal(false);
  rfidInput  = '';
  private refreshInterval?: ReturnType<typeof setInterval>;

  enReparto   = computed(() => this.registros().filter(r => r.estado === 'Reparto').length);
  disponibles = computed(() => this.registros().filter(r => r.estado === 'Disponible').length);
  sinConductor = computed(() => this.registros().filter(r => !r.conductor).length);

  ngOnInit() {
    this.cargar();
    this.refreshInterval = setInterval(() => this.cargar(), 30_000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  cargar() {
    this.loading.set(true);
    this.registroService.getAll().subscribe({
      next:  data => { this.registros.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar registros', 'error'); }
    });
  }

  registrar() {
    const rfid = this.rfidInput.trim();
    if (!rfid) return;

    this.registrando.set(true);
    this.registroService.registrarAcceso(rfid).subscribe({
      next: (res) => {
        const accion = res.entradaAt ? 'Entrada' : 'Salida';
        this.toastService.show(`${accion} registrada correctamente`, 'success');
        this.rfidInput = '';
        this.registrando.set(false);
        this.cargar();
      },
      error: (err) => {
        const msg = this.parseError(err);
        this.toastService.show(msg, 'error');
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

  private parseError(err: any): string {
    const status = err?.status;
    if (status === 404) return 'Conductor o camión no encontrado';
    if (status === 409) return 'No hay registro de salida abierto para cerrar';
    if (status === 429) return 'Han pasado menos de 15 minutos desde el último registro';
    if (status === 400) return 'RFID no válido';
    return err?.error?.message ?? 'Error al registrar acceso';
  }
}
