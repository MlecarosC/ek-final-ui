import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Usuario, CreateUsuarioDto } from '../../shared/models/usuario.model';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';
import { environment } from '../../../environments/environment.development';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser', () => {
    const mockUserDto: CreateUsuarioDto = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      departmentId: 1,
    };

    const mockUserResponse: Usuario = {
      id: 1,
      ...mockUserDto,
    };

    it('should create user successfully', (done) => {
      service.createUser(mockUserDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserResponse);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserDto);
      req.flush(mockUserResponse);
    });

    it('should handle 400 error with custom message', (done) => {
      const errorResponse = { message: 'Nombre inválido' };

      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('Nombre inválido');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 400 error with default message', (done) => {
      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('Datos inválidos');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 409 error (duplicate email)', (done) => {
      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('El email ya está registrado');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({}, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 500 error', (done) => {
      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('Error en el servidor');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error (ErrorEvent)', (done) => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'No hay conexión a internet',
      });

      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('Error de conexión: No hay conexión a internet');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.error(errorEvent);
    });

    it('should handle unknown error status', (done) => {
      service.createUser(mockUserDto).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toContain('Error del servidor (503)');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({}, { status: 503, statusText: 'Service Unavailable' });
    });
  });

  describe('getUsersByDepartment', () => {
    const mockDepartmentData: UsuariosByDepartment[] = [
      { departmentId: 1, departmentName: 'Ventas', userCount: 5 },
      { departmentId: 2, departmentName: 'Recursos Humanos', userCount: 3 },
      { departmentId: 3, departmentName: 'Contabilidad', userCount: 2 },
    ];

    it('should get users by department successfully', (done) => {
      service.getUsersByDepartment().subscribe({
        next: (response) => {
          expect(response).toEqual(mockDepartmentData);
          expect(response.length).toBe(3);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${apiUrl}/by-categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDepartmentData);
    });

    it('should handle error when getting users by department', fakeAsync(() => {
      let errorReceived = false;

      service.getUsersByDepartment().subscribe({
        next: () => fail('Should have failed'),
        error: (error: Error) => {
          expect(error.message).toBe('Error en el servidor');
          errorReceived = true;
        },
      });

      // Primer intento
      const req1 = httpMock.expectOne(`${apiUrl}/by-categories`);
      req1.flush({}, { status: 500, statusText: 'Internal Server Error' });
      
      tick(1000); // Esperar delay del retry

      // Segundo intento
      const req2 = httpMock.expectOne(`${apiUrl}/by-categories`);
      req2.flush({}, { status: 500, statusText: 'Internal Server Error' });
      
      tick(1000); // Esperar delay del retry

      // Tercer intento
      const req3 = httpMock.expectOne(`${apiUrl}/by-categories`);
      req3.flush({}, { status: 500, statusText: 'Internal Server Error' });

      tick(); // Procesar el error

      expect(errorReceived).toBe(true);
    }));

    it('should handle empty response', (done) => {
      service.getUsersByDepartment().subscribe({
        next: (response) => {
          expect(response).toEqual([]);
          expect(response.length).toBe(0);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${apiUrl}/by-categories`);
      req.flush([]);
    });

    it('should retry on failure and succeed on second attempt', fakeAsync(() => {
      let successReceived = false;

      service.getUsersByDepartment().subscribe({
        next: (response) => {
          expect(response).toEqual(mockDepartmentData);
          successReceived = true;
        },
        error: () => fail('Should have succeeded'),
      });

      // Primer intento - falla
      const req1 = httpMock.expectOne(`${apiUrl}/by-categories`);
      req1.flush({}, { status: 500, statusText: 'Internal Server Error' });
      
      tick(1000); // Esperar delay del retry

      // Segundo intento - exitoso
      const req2 = httpMock.expectOne(`${apiUrl}/by-categories`);
      req2.flush(mockDepartmentData);

      tick(); // Procesar la respuesta exitosa

      expect(successReceived).toBe(true);
    }));
  });
});
