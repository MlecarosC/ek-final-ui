import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { Usuario } from '../../shared/models/usuario.model';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  createUser(usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
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
      errorMessage = `Error del servidor (${error.status}): ${error.message}`;
    }
    
    console.error('Error en UsuarioService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}