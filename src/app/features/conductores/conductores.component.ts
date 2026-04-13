import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConductorService } from '../../core/services/conductor.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { ToastService } from '../../core/services/toast.service';
import { Conductor } from '../../core/models/conductor.model';
import { Empresa } from '../../core/models/empresa.model';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/molecules/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-conductores',
  imports: [FormsModule, ButtonComponent, SpinnerComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-100">👤 Conductores</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ conductores().length }} conductor{{ conductores().length !== 1 ? 'es' : '' }} registrado{{ conductores().length !== 1 ? 's' : '' }}</p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="abrirCrear()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          ➕ Nuevo conductor
        </app-button>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="filtro"
          placeholder="Buscar por nombre, RUT o empresa..."
          class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200
                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40
                 focus:border-orange-500/40 transition-all"
        />
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-slate-400">{{ filtro() ? 'Sin resultados' : 'Sin conductores' }}</p>
            <p class="text-xs text-slate-600 mt-1">
              {{ filtro() ? 'Prueba con otro término de búsqueda' : 'Agrega conductores con el botón de arriba' }}
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Conductor</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">RUT</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Empresa</th>
                  <th class="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (con of filtrados(); track con.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors group">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-medium text-slate-300">
                          {{ initials(con) }}
                        </div>
                        <div>
                          <p class="font-medium text-slate-200">{{ con.nombre }} {{ con.apellido }}</p>
                          <p class="text-xs text-slate-500 sm:hidden font-mono">{{ con.rut }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 hidden sm:table-cell">
                      <span class="font-mono text-slate-400 text-xs">{{ con.rut }}</span>
                    </td>
                    <td class="px-5 py-3.5 hidden md:table-cell">
                      <span class="text-slate-300 text-sm">{{ con.empresa ? con.empresa.nombre : '—' }}</span>
                    </td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          class="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          (click)="abrirEditar(con)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          (click)="pedirEliminar(con)"
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
      [title]="editando() ? 'Editar conductor' : 'Nuevo conductor'"
      [isOpen]="modalAbierto()"
      (closed)="cerrarModal()"
    >
      <form (ngSubmit)="guardar()" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Nombre</label>
            <input type="text" [(ngModel)]="form.nombre" name="nombre" required placeholder="Carlos"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                     focus:border-orange-500/40 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Apellido</label>
            <input type="text" [(ngModel)]="form.apellido" name="apellido" required placeholder="Muñoz"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                     focus:border-orange-500/40 transition-all" />
          </div>
        </div>

        @if (!editando()) {
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">RUT</label>
            <input type="text" [(ngModel)]="form.rut" name="rut" required placeholder="14.823.441-K"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                     placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
                     focus:border-orange-500/40 transition-all" />
          </div>
        }

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Empresa</label>
          <select [(ngModel)]="form.empresa" name="empresa"
            [required]="!editando()"
            class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                   text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all">
            <option value="">Selecciona una empresa</option>
            @for (emp of empresas(); track emp.id) {
              <option [value]="emp.nombre">{{ emp.nombre }}</option>
            }
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <app-button variant="secondary" size="sm" type="button" (clicked)="cerrarModal()">Cancelar</app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="guardando()">
            {{ editando() ? 'Actualizar' : 'Crear conductor' }}
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Confirm delete -->
    <app-confirm-dialog
      [isOpen]="confirmarEliminar()"
      [message]="'¿Deseas eliminar al conductor ' + (conductorAEliminar()?.nombre ?? '') + ' ' + (conductorAEliminar()?.apellido ?? '') + '?'"
      (confirmed)="eliminar()"
      (cancelled)="confirmarEliminar.set(false)"
    />
  `
})
export class ConductoresComponent implements OnInit {
  private conductorService = inject(ConductorService);
  private empresaService   = inject(EmpresaService);
  private toastService     = inject(ToastService);

  conductores         = signal<Conductor[]>([]);
  empresas            = signal<Empresa[]>([]);
  loading             = signal(false);
  guardando           = signal(false);
  modalAbierto        = signal(false);
  confirmarEliminar   = signal(false);
  editando            = signal<Conductor | null>(null);
  conductorAEliminar  = signal<Conductor | null>(null);
  filtro              = signal('');

  form = { nombre: '', apellido: '', rut: '', empresa: '' };

  filtrados = () => {
    const q = this.filtro().toLowerCase();
    if (!q) return this.conductores();
    return this.conductores().filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.rut.toLowerCase().includes(q) ||
      (c.empresa?.nombre ?? '').toLowerCase().includes(q)
    );
  };

  ngOnInit() {
    this.cargar();
    this.empresaService.getAll().subscribe({ next: data => this.empresas.set(data) });
  }

  cargar() {
    this.loading.set(true);
    this.conductorService.getAll().subscribe({
      next:  data => { this.conductores.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar conductores', 'error'); }
    });
  }

  initials(c: Conductor) {
    return `${c.nombre[0] ?? ''}${c.apellido[0] ?? ''}`.toUpperCase();
  }

  abrirCrear() {
    this.editando.set(null);
    this.form = { nombre: '', apellido: '', rut: '', empresa: '' };
    this.modalAbierto.set(true);
  }

  abrirEditar(con: Conductor) {
    this.editando.set(con);
    this.form = {
      nombre:   con.nombre,
      apellido: con.apellido,
      rut:      con.rut,
      empresa:  con.empresa?.nombre ?? ''
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
      ? this.conductorService.update(editing.id, {
          nombre:   this.form.nombre   || undefined,
          apellido: this.form.apellido || undefined,
          empresa:  this.form.empresa  || undefined,
        })
      : this.conductorService.create({
          nombre:   this.form.nombre,
          apellido: this.form.apellido,
          rut:      this.form.rut,
          empresa:  this.form.empresa,
        });

    op.subscribe({
      next: () => {
        this.toastService.show(editing ? 'Conductor actualizado' : 'Conductor creado', 'success');
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

  pedirEliminar(con: Conductor) {
    this.conductorAEliminar.set(con);
    this.confirmarEliminar.set(true);
  }

  eliminar() {
    const con = this.conductorAEliminar();
    if (!con) return;
    this.conductorService.delete(con.id).subscribe({
      next: () => {
        this.toastService.show('Conductor eliminado', 'success');
        this.confirmarEliminar.set(false);
        this.cargar();
      },
      error: () => {
        this.toastService.show('Error al eliminar conductor', 'error');
        this.confirmarEliminar.set(false);
      }
    });
  }

  private parseError(err: any): string {
    if (err?.status === 409) return 'RUT o RFID ya registrado';
    if (err?.status === 404) return 'Empresa no encontrada';
    return err?.error?.message ?? 'Error al guardar conductor';
  }
}
