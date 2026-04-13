import { Conductor } from './conductor.model';

export type EstadoCamion = 'Disponible' | 'Reparto';

export interface Camion {
  id: number;
  patente: string;
  rfid: string;
  marca: string;
  modelo: string;
  carga: string;
  estado: EstadoCamion;
  conductorId: number;
  conductor: Conductor;
}

export interface CreateCamionDto {
  patente: string;
  rfid: string;
  marca: string;
  modelo: string;
  carga: string;
  conductor: string;
  estado?: EstadoCamion;
}

export interface UpdateCamionDto {
  rfid?: string;
  marca?: string;
  modelo?: string;
  carga?: string;
  conductor?: string;
  estado?: EstadoCamion;
}
