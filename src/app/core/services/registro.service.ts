import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistroView, RegistroCreado } from '../models/registro.model';

const BASE = 'https://api-truckmanager.devsonic.cl';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<RegistroView[]>(`${BASE}/registro`);
  }

  registrarAcceso(rfid: string) {
    return this.http.post<RegistroCreado>(`${BASE}/registro`, null, {
      params: { rfid }
    });
  }
}
