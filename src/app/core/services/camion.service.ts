import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Camion, CreateCamionDto, UpdateCamionDto } from '../models/camion.model';

const BASE = 'https://api-truckmanager.devsonic.cl';

@Injectable({ providedIn: 'root' })
export class CamionService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Camion[]>(`${BASE}/camion`);
  }

  create(dto: CreateCamionDto) {
    return this.http.post<Camion>(`${BASE}/camion`, dto);
  }

  update(id: number, dto: UpdateCamionDto) {
    return this.http.patch<Camion>(`${BASE}/camion`, dto, {
      params: { id: id.toString() }
    });
  }

  delete(id: number) {
    return this.http.delete<Camion>(`${BASE}/camion`, {
      params: { id: id.toString() }
    });
  }
}
