import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto, Usuario } from '../../shared/models/usuario.model';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';
import { environment } from '../../../environments/environment.development';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService],
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
    it('should create a user successfully', () => {
      const mockUser: CreateUsuarioDto = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      const mockResponse: Usuario = {
        id: 1,
        ...mockUser,
      };

      service.createUser(mockUser).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.id).toBe(1);
        expect(response.name).toBe('Juan Pérez');
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);
      req.flush(mockResponse);
    });

    it('should handle 409 conflict error (duplicate email)', () => {
      const mockUser: CreateUsuarioDto = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      service.createUser(mockUser).subscribe({
        next: () => fail('should have failed with 409 error'),
        error: (error) => {
          expect(error.message).toBe('El email ya está registrado');
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 400 bad request error', () => {
      const mockUser: CreateUsuarioDto = {
        name: '',
        email: 'invalid-email',
        departmentId: 1,
      };

      service.createUser(mockUser).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.message).toContain('Datos inválidos');
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/create`);
      req.flush({ message: 'Invalid data' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getUsersByDepartment', () => {
    it('should get users by department successfully', () => {
      const mockData: UsuariosByDepartment[] = [
        { departmentId: 1, departmentName: 'Ventas', userCount: 5 },
        { departmentId: 2, departmentName: 'Recursos Humanos', userCount: 3 },
        { departmentId: 3, departmentName: 'Contabilidad', userCount: 2 },
      ];

      service.getUsersByDepartment().subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(data.length).toBe(3);
        expect(data[0].departmentName).toBe('Ventas');
        expect(data[0].userCount).toBe(5);
      });

      const req = httpMock.expectOne(`${apiUrl}/by-categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array when no data', () => {
      const mockData: UsuariosByDepartment[] = [];

      service.getUsersByDepartment().subscribe((data) => {
        expect(data).toEqual([]);
        expect(data.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/by-categories`);
      req.flush(mockData);
    });

    it('should handle 500 server error', () => {
      service.getUsersByDepartment().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toContain('Error en el servidor');
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/by-categories`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
