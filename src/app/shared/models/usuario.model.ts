export interface Usuario {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

export interface CreateUsuarioDto {
  name: string;
  email: string;
  departmentId: number;
}
