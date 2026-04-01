import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conductor, CreateConductorDto, UpdateConductorDto } from '../models/conductor.model';

const BASE = 'https://api-truckmanager.devsonic.cl';

@Injectable({ providedIn: 'root' })
export class ConductorService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Conductor[]>(`${BASE}/conductor`);
  }

  create(dto: CreateConductorDto) {
    return this.http.post<Conductor>(`${BASE}/conductor`, dto);
  }

  update(id: number, dto: UpdateConductorDto) {
    return this.http.patch<Conductor>(`${BASE}/conductor`, dto, {
      params: { id: id.toString() }
    });
  }

  delete(id: number) {
    return this.http.delete<Conductor>(`${BASE}/conductor`, {
      params: { id: id.toString() }
    });
  }
}
