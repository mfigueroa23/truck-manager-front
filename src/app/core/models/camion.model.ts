import { Conductor } from './conductor.model';

export type EstadoCamion = 'Disponible' | 'Reparto';

export interface Camion {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  carga: string;
  estado: EstadoCamion;
  conductorId: number;
  conductor: Conductor;
}

export interface CreateCamionDto {
  patente: string;
  marca: string;
  modelo: string;
  carga: string;
  conductor: string;
  estado?: EstadoCamion;
}

export interface UpdateCamionDto {
  marca?: string;
  modelo?: string;
  carga?: string;
  conductor?: string;
  estado?: EstadoCamion;
}
