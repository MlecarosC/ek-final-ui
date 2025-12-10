import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { UsuariosComponent } from '../../pages/usuarios/usuarios.component';

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

    fixture.detectChanges(); // ngOnInit()
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    const form = component.usuarioForm;
    expect(form).toBeDefined();
    expect(form.get('name')?.value).toBe('');
    expect(form.get('email')?.value).toBe('');
    expect(form.get('departmentId')?.value).toBeNull();
  });

  describe('loadChartData', () => {
    it('should load chart data and update barChartData', () => {
      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      expect(usuarioService.getUsersByDepartment).toHaveBeenCalled();
      const chartData = component.barChartData();
      expect(chartData.labels).toEqual(['Ventas', 'Recursos Humanos', 'Contabilidad']);
      expect(chartData.datasets[0].data).toEqual([5, 3, 2]);
    });

    it('should handle error when loading chart data', () => {
      usuarioService.getUsersByDepartment.mockReturnValue(
        throwError(() => new Error('Error al cargar'))
      );

      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
      expect(component.notificationMessage()).toBe('Error al cargar el gráfico');
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(usuarioService.createUser).not.toHaveBeenCalled();
    });

    it('should submit valid form successfully', () => {
      const mockUser = { name: 'Juan Pérez', email: 'juan@example.com', departmentId: 1 };
      component.usuarioForm.patchValue(mockUser);
      usuarioService.createUser.mockReturnValue(of({ id: 1, ...mockUser }));
      usuarioService.getUsersByDepartment.mockReturnValue(of(mockChartData));

      component.onSubmit();

      expect(usuarioService.createUser).toHaveBeenCalledWith(mockUser);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('success');
      expect(component.notificationMessage()).toBe('¡Usuario agregado con éxito!');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle error on submit', () => {
      const mockUser = { name: 'Juan Pérez', email: 'juan@example.com', departmentId: 1 };
      component.usuarioForm.patchValue(mockUser);
      usuarioService.createUser.mockReturnValue(
        throwError(() => new Error('Error al crear usuario'))
      );

      component.onSubmit();

      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
      expect(component.notificationMessage()).toBe('Error al crear usuario');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('notification helpers', () => {
    it('should close notification', () => {
      component.showNotification.set(true);
      component.closeNotification();
      expect(component.showNotification()).toBe(false);
    });

    it('should hide notification after timeout', fakeAsync(() => {
      component['showNotificationMessage']('Test', 'success');
      expect(component.showNotification()).toBe(true);
      tick(4000);
      expect(component.showNotification()).toBe(false);
    }));
  });

  describe('form validation helpers', () => {
    it('should detect required field error', () => {
      const field = component.usuarioForm.get('name');
      field?.markAsTouched();
      expect(component.isFieldInvalid('name')).toBe(true);
      expect(component.getFieldError('name')).toBe('Este campo es obligatorio');
    });

    it('should detect email format error', () => {
      const field = component.usuarioForm.get('email');
      field?.setValue('invalid-email');
      field?.markAsTouched();
      expect(component.isFieldInvalid('email')).toBe(true);
      expect(component.getFieldError('email')).toBe('Formato de email inválido');
    });

    it('should detect maxlength error', () => {
      const field = component.usuarioForm.get('name');
      field?.setValue('x'.repeat(51));
      field?.markAsTouched();
      expect(component.isFieldInvalid('name')).toBe(true);
      expect(component.getFieldError('name')).toBe('Máximo 50 caracteres');
    });
  });
});
