import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { UsuariosComponent } from './usuarios.component';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let usuarioService: jest.Mocked<UsuarioService>;

  const mockChartData: UsuariosByDepartment[] = [
    { departmentId: 1, departmentName: 'Ventas', userCount: 5 },
    { departmentId: 2, departmentName: 'Recursos Humanos', userCount: 3 },
    { departmentId: 3, departmentName: 'Contabilidad', userCount: 2 },
  ];

  beforeEach(async () => {
    const usuarioServiceMock: jest.Mocked<Partial<UsuarioService>> = {
      createUser: jest.fn(),
      getUsersByDepartment: jest.fn().mockReturnValue(of(mockChartData)),
    };

    await TestBed.configureTestingModule({
      imports: [UsuariosComponent, ReactiveFormsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: UsuarioService, useValue: usuarioServiceMock },
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    usuarioService = TestBed.inject(UsuarioService) as jest.Mocked<UsuarioService>;

    fixture.detectChanges(); // inicializa ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.usuarioForm).toBeDefined();
    expect(component.usuarioForm.get('name')?.value).toBe('');
    expect(component.usuarioForm.get('email')?.value).toBe('');
    expect(component.usuarioForm.get('departmentId')?.value).toBeNull();
  });

  describe('loadChartData', () => {
    it('should load chart data successfully', () => {
      usuarioService.getUsersByDepartment.mockReturnValue(of(mockChartData));

      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      expect(usuarioService.getUsersByDepartment).toHaveBeenCalled();
    });

    it('should handle error when loading chart data', () => {
      usuarioService.getUsersByDepartment.mockReturnValue(
        throwError(() => new Error('Error al cargar'))
      );

      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(usuarioService.createUser).not.toHaveBeenCalled();
    });

    it('should submit valid form successfully', () => {
      const mockUser = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      component.usuarioForm.patchValue(mockUser);
      usuarioService.createUser.mockReturnValue(of({ id: 1, ...mockUser }));
      usuarioService.getUsersByDepartment.mockReturnValue(of(mockChartData));

      component.onSubmit();

      expect(usuarioService.createUser).toHaveBeenCalledWith(mockUser);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('success');
      expect(component.notificationMessage()).toBe('¡Usuario agregado con éxito!');
    });

    it('should handle error on submit', () => {
      const mockUser = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };
      component.usuarioForm.patchValue(mockUser);

      usuarioService.createUser.mockReturnValue(
        throwError(() => new Error('Error al crear usuario'))
      );

      component.onSubmit();

      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
    });
  });
});
