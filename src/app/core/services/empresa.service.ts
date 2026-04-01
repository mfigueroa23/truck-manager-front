import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Empresa } from '../models/empresa.model';

const BASE = 'https://api-truckmanager.devsonic.cl';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Empresa[]>(`${BASE}/empresa`);
  }

  create(nombre: string) {
    return this.http.post<Empresa>(`${BASE}/empresa`, null, { params: { nombre } });
  }

  update(id: number, nombre: string) {
    return this.http.put<Empresa>(`${BASE}/empresa`, null, { params: { id: id.toString(), nombre } });
  }

  delete(id: number) {
    return this.http.delete<Empresa>(`${BASE}/empresa`, { params: { id: id.toString() } });
  }
}
