import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../core/services/empresa.service';
import { ToastService } from '../../core/services/toast.service';
import { Empresa } from '../../core/models/empresa.model';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/atoms/spinner/spinner.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/molecules/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-empresas',
  imports: [FormsModule, ButtonComponent, SpinnerComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">🏢 Empresas</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ empresas().length }} empresa{{ empresas().length !== 1 ? 's' : '' }} registrada{{ empresas().length !== 1 ? 's' : '' }}</p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="abrirCrear()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          ➕ Nueva empresa
        </app-button>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="filtro"
          placeholder="Buscar empresa..."
          class="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm
                 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600
                 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
        />
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <app-spinner size="lg" class="text-orange-500" />
          </div>
        } @else if (filtradas().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
              {{ filtro() ? 'Sin resultados' : 'Sin empresas' }}
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-600 mt-1">
              {{ filtro() ? 'No se encontraron empresas con ese nombre' : 'Crea la primera empresa con el botón de arriba' }}
            </p>
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800">
                <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-16">ID</th>
                <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                <th class="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              @for (emp of filtradas(); track emp.id) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td class="px-5 py-3.5">
                    <span class="text-xs font-mono text-slate-400 dark:text-slate-600">#{{ emp.id }}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="font-medium text-slate-800 dark:text-slate-200">{{ emp.nombre }}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        (click)="abrirEditar(emp)"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        (click)="pedirEliminar(emp)"
                        title="Eliminar"
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
        }
      </div>
    </div>

    <!-- Modal crear/editar -->
    <app-modal
      [title]="editando() ? 'Editar empresa' : 'Nueva empresa'"
      [isOpen]="modalAbierto()"
      (closed)="cerrarModal()"
    >
      <form (ngSubmit)="guardar()" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nombre de la empresa</label>
          <input
            type="text"
            [(ngModel)]="form.nombre"
            name="nombre"
            placeholder="Ej: LogiCargo S.A."
            required
            class="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                   text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600
                   text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <app-button variant="secondary" size="sm" type="button" (clicked)="cerrarModal()">Cancelar</app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="guardando()" [disabled]="!form.nombre.trim()">
            {{ editando() ? 'Actualizar' : 'Crear empresa' }}
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Confirm delete -->
    <app-confirm-dialog
      [isOpen]="confirmarEliminar()"
      [message]="'¿Deseas eliminar la empresa &quot;' + (empresaAEliminar()?.nombre ?? '') + '&quot;? Esta acción no se puede deshacer.'"
      (confirmed)="eliminar()"
      (cancelled)="confirmarEliminar.set(false)"
    />
  `
})
export class EmpresasComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private toastService   = inject(ToastService);

  empresas          = signal<Empresa[]>([]);
  loading           = signal(false);
  guardando         = signal(false);
  modalAbierto      = signal(false);
  confirmarEliminar = signal(false);
  editando          = signal<Empresa | null>(null);
  empresaAEliminar  = signal<Empresa | null>(null);
  filtro            = signal('');

  form = { nombre: '' };

  filtradas = () => {
    const q = this.filtro().toLowerCase();
    return this.empresas().filter(e => e.nombre.toLowerCase().includes(q));
  };

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.empresaService.getAll().subscribe({
      next:  data => { this.empresas.set(data); this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.toastService.show('Error al cargar empresas', 'error'); }
    });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form = { nombre: '' };
    this.modalAbierto.set(true);
  }

  abrirEditar(emp: Empresa) {
    this.editando.set(emp);
    this.form = { nombre: emp.nombre };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editando.set(null);
  }

  guardar() {
    if (!this.form.nombre.trim()) return;
    this.guardando.set(true);

    const op = this.editando()
      ? this.empresaService.update(this.editando()!.id, this.form.nombre.trim())
      : this.empresaService.create(this.form.nombre.trim());

    op.subscribe({
      next: () => {
        this.toastService.show(
          this.editando() ? 'Empresa actualizada' : 'Empresa creada',
          'success'
        );
        this.guardando.set(false);
        this.cerrarModal();
        this.cargar();
      },
      error: (err) => {
        const msg = err?.status === 409 ? 'Ya existe una empresa con ese nombre' : 'Error al guardar';
        this.toastService.show(msg, 'error');
        this.guardando.set(false);
      }
    });
  }

  pedirEliminar(emp: Empresa) {
    this.empresaAEliminar.set(emp);
    this.confirmarEliminar.set(true);
  }

  eliminar() {
    const emp = this.empresaAEliminar();
    if (!emp) return;
    this.empresaService.delete(emp.id).subscribe({
      next: () => {
        this.toastService.show('Empresa eliminada', 'success');
        this.confirmarEliminar.set(false);
        this.cargar();
      },
      error: () => {
        this.toastService.show('Error al eliminar empresa', 'error');
        this.confirmarEliminar.set(false);
      }
    });
  }
}
