import { Empresa } from './empresa.model';

export interface Conductor {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  rfid: string;
  empresaId: number;
  empresa: Empresa;
}

export interface CreateConductorDto {
  nombre: string;
  apellido: string;
  rut: string;
  rfid: string;
  empresa: string;
}

export interface UpdateConductorDto {
  nombre?: string;
  apellido?: string;
  rfid?: string;
  empresa?: string;
}
