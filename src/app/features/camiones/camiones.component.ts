import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CamionService } from '../../core/services/camion.service';
import { ConductorService } from '../../core/services/conductor.service';
import { ToastService } from '../../core/services/toast.service';
import { Camion } from '../../core/models/camion.model';
import { Conductor } from '../../core/models/conductor.model';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/molecules/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-camiones',
  imports: [FormsModule, BadgeComponent, ButtonComponent, SpinnerComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-100">🚛 Camiones</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ camiones().length }} camión{{ camiones().length !== 1 ? 'es' : '' }} en flota</p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="abrirCrear()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          ➕ Nuevo camión
        </app-button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="filtroTexto"
            placeholder="Buscar por patente, marca o modelo..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200
                   placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40
                   focus:border-orange-500/40 transition-all"
          />
        </div>
        <select
          [(ngModel)]="filtroEstado"
          class="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Reparto">En reparto</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <app-spinner size="lg" class="text-orange-500" />
          </div>
        } @else if (filtrados().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9.5L17 7h-4v9z"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-slate-400">{{ (filtroTexto || filtroEstado) ? 'Sin resultados' : 'Sin camiones' }}</p>
            <p class="text-xs text-slate-600 mt-1">
              {{ (filtroTexto || filtroEstado) ? 'Prueba con otros filtros' : 'Agrega camiones con el botón de arriba' }}
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Patente</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Vehículo</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Carga</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Conductor</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th class="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (cam of filtrados(); track cam.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors group">
                    <td class="px-5 py-3.5">
                      <span class="font-mono font-bold text-orange-400">{{ cam.patente }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden sm:table-cell">
                      <p class="font-medium text-slate-200">{{ cam.marca }} {{ cam.modelo }}</p>
                    </td>
                    <td class="px-5 py-3.5 hidden md:table-cell">
                      <span class="text-slate-400 text-xs">{{ cam.carga }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell">
                      @if (cam.conductor) {
                        <div>
                          <p class="text-slate-300 text-sm">{{ cam.conductor.nombre }} {{ cam.conductor.apellido }}</p>
                          <p class="text-xs text-slate-600 font-mono">{{ cam.conductor.rut }}</p>
                        </div>
                      } @else {
                        <span class="text-slate-600 text-xs">Sin conductor</span>
                      }
                    </td>
                    <td class="px-5 py-3.5">
                      <app-badge [variant]="cam.estado === 'Disponible' ? 'success' : 'warning'">
                        {{ cam.estado }}
                      </app-badge>
                    </td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          class="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          (click)="abrirEditar(cam)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          (click)="pedirEliminar(cam)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    <app-modal
      [title]="editando() ? 'Editar camión' : 'Nuevo camión'"
      [isOpen]="modalAbierto()"
      (closed)="cerrarModal()"
    >
      <form (ngSubmit)="guardar()" class="space-y-4">

        @if (!editando()) {
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Patente</label>
              <input type="text" [(ngModel)]="form.patente" name="patente" required placeholder="BCFT-79"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                       placeholder:text-slate-600 text-sm font-mono focus:outline-none focus:ring-2
                       focus:ring-orange-500/40 focus:border-orange-500/40 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">RFID</label>
              <input type="text" [(ngModel)]="form.rfid" name="rfid" required placeholder="A1B2C3D4"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                       placeholder:text-slate-600 text-sm font-mono focus:outline-none focus:ring-2
                       focus:ring-orange-500/40 focus:border-orange-500/40 transition-all" />
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
              <span class="text-xs text-slate-500">Patente:</span>
              <span class="font-mono font-bold text-orange-400">{{ editando()?.patente }}</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">RFID</label>
              <input type="text" [(ngModel)]="form.rfid" name="rfid" placeholder="A1B2C3D4"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                       placeholder:text-slate-600 text-sm font-mono focus:outline-none focus:ring-2
                       focus:ring-orange-500/40 focus:border-orange-500/40 transition-all" />
            </div>
          </div>
        }

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Marca</label>
            <input type="text" [(ngModel)]="form.marca" name="marca" [required]="!editando()" placeholder="Volvo"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                     focus:border-orange-500/40 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Modelo</label>
            <input type="text" [(ngModel)]="form.modelo" name="modelo" [required]="!editando()" placeholder="FH16"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                     focus:border-orange-500/40 transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Tipo de carga</label>
          <input type="text" [(ngModel)]="form.carga" name="carga" [required]="!editando()" placeholder="Materias primas"
            class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                   placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                   focus:border-orange-500/40 transition-all" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Conductor (RUT)</label>
            <select [(ngModel)]="form.conductor" name="conductor"
              [required]="!editando()"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all">
              <option value="">Seleccionar...</option>
              @for (con of conductores(); track con.id) {
                <option [value]="con.rut">{{ con.nombre }} {{ con.apellido }} – {{ con.rut }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Estado</label>
            <select [(ngModel)]="form.estado" name="estado"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all">
              <option value="Disponible">Disponible</option>
              <option value="Reparto">En reparto</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <app-button variant="secondary" size="sm" type="button" (clicked)="cerrarModal()">Cancelar</app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="guardando()">
            {{ editando() ? 'Actualizar' : 'Crear camión' }}
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Confirm delete -->
    <app-confirm-dialog
      [isOpen]="confirmarEliminar()"
      [message]="'¿Deseas eliminar el camión con patente ' + (camionAEliminar()?.patente ?? '') + '?'"
      (confirmed)="eliminar()"
      (cancelled)="confirmarEliminar.set(false)"
    />
  `
})
export class CamionesComponent implements OnInit {
  private camionService    = inject(CamionService);
  private conductorService = inject(ConductorService);
  private toastService     = inject(ToastService);

  camiones          = signal<Camion[]>([]);
  conductores       = signal<Conductor[]>([]);
  loading           = signal(false);
  guardando         = signal(false);
  modalAbierto      = signal(false);
  confirmarEliminar = signal(false);
  editando          = signal<Camion | null>(null);
  camionAEliminar   = signal<Camion | null>(null);

  filtroTexto  = '';
  filtroEstado = '';

  form = { patente: '', rfid: '', marca: '', modelo: '', carga: '', conductor: '', estado: 'Disponible' };

  filtrados = () => {
    let list = this.camiones();
    const q = this.filtroTexto.toLowerCase();
    if (q) list = list.filter(c =>
      c.patente.toLowerCase().includes(q) ||
      c.marca.toLowerCase().includes(q) ||
      c.modelo.toLowerCase().includes(q)
    );
    if (this.filtroEstado) list = list.filter(c => c.estado === this.filtroEstado);
    return list;
  };

  ngOnInit() {
    this.cargar();
    this.conductorService.getAll().subscribe({ next: data => this.conductores.set(data) });
  }

  cargar() {
    this.loading.set(true);
    this.camionService.getAll().subscribe({
      next:  data => { this.camiones.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar camiones', 'error'); }
    });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form = { patente: '', rfid: '', marca: '', modelo: '', carga: '', conductor: '', estado: 'Disponible' };
    this.modalAbierto.set(true);
  }

  abrirEditar(cam: Camion) {
    this.editando.set(cam);
    this.form = {
      patente:   cam.patente,
      rfid:      cam.rfid ?? '',
      marca:     cam.marca,
      modelo:    cam.modelo,
      carga:     cam.carga,
      conductor: cam.conductor?.rut ?? '',
      estado:    cam.estado,
    };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editando.set(null);
  }

  guardar() {
    this.guardando.set(true);
    const editing = this.editando();

    const op = editing
      ? this.camionService.update(editing.id, {
          rfid:      this.form.rfid      || undefined,
          marca:     this.form.marca     || undefined,
          modelo:    this.form.modelo    || undefined,
          carga:     this.form.carga     || undefined,
          conductor: this.form.conductor || undefined,
          estado:    (this.form.estado as any) || undefined,
        })
      : this.camionService.create({
          patente:   this.form.patente,
          rfid:      this.form.rfid,
          marca:     this.form.marca,
          modelo:    this.form.modelo,
          carga:     this.form.carga,
          conductor: this.form.conductor,
          estado:    this.form.estado as any,
        });

    op.subscribe({
      next: () => {
        this.toastService.show(editing ? 'Camión actualizado' : 'Camión creado', 'success');
        this.guardando.set(false);
        this.cerrarModal();
        this.cargar();
      },
      error: (err) => {
        const msg = this.parseError(err);
        this.toastService.show(msg, 'error');
        this.guardando.set(false);
      }
    });
  }

  pedirEliminar(cam: Camion) {
    this.camionAEliminar.set(cam);
    this.confirmarEliminar.set(true);
  }

  eliminar() {
    const cam = this.camionAEliminar();
    if (!cam) return;
    this.camionService.delete(cam.id).subscribe({
      next: () => {
        this.toastService.show('Camión eliminado', 'success');
        this.confirmarEliminar.set(false);
        this.cargar();
      },
      error: () => {
        this.toastService.show('Error al eliminar camión', 'error');
        this.confirmarEliminar.set(false);
      }
    });
  }

  private parseError(err: any): string {
    if (err?.status === 409) return 'La patente ya está registrada';
    if (err?.status === 404) return 'Conductor no encontrado';
    return err?.error?.message ?? 'Error al guardar camión';
  }
}
