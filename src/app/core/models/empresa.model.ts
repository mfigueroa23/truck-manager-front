export interface Empresa {
  id: number;
  nombre: string;
}

export interface CreateEmpresaDto {
  nombre: string;
}

export interface UpdateEmpresaDto {
  id: number;
  nombre: string;
}
