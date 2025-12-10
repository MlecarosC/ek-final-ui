import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { Usuario, CreateUsuarioDto } from '../../shared/models/usuario.model';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  createUser(usuario: CreateUsuarioDto): Observable<Usuario> {
    const url = `${this.apiUrl}/create`;
    return this.http.post<Usuario>(url, usuario).pipe(
      timeout(environment.apiTimeout),
      catchError(this.handleError)
    );
  }

  getUsersByDepartment(): Observable<UsuariosByDepartment[]> {
    const url = `${this.apiUrl}/by-categories`;
    return this.http.get<UsuariosByDepartment[]>(url).pipe(
      timeout(environment.apiTimeout),
      retry({ count: 2, delay: 1000 }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error al procesar la solicitud';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 409:
          errorMessage = 'El email ya está registrado';
          break;
        case 500:
          errorMessage = 'Error en el servidor';
          break;
        default:
          errorMessage = `Error del servidor (${error.status}): ${error.message}`;
      }
    }
    
    console.error('Error en UsuarioService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
