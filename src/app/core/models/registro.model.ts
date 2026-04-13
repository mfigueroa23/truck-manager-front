import { Camion } from './camion.model';

export interface RegistroView {
  patente: string;
  marca: string;
  modelo: string;
  conductor: {
    nombre: string;
    rut: string;
  } | null;
  empresa: string;
  tipoCarga: string;
  salida: string | null;
  ingreso: string | null;
  estado: 'Disponible' | 'Reparto';
}

export interface RegistroCreado {
  id: number;
  salidaAt: string;
  entradaAt: string | null;
  camionId: number;
  camion: Camion;
}

export interface HistoricoItem {
  id: number;
  patente: string;
  conductor: {
    nombre: string;
    rut: string;
  };
  empresa: string;
  tipoCarga: string;
  salidaAt: string;
  entradaAt: string;
}
