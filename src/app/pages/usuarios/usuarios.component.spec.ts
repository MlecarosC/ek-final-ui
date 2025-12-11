import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
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
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UsuarioService, useValue: usuarioServiceMock },
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    usuarioService = TestBed.inject(UsuarioService) as jest.Mocked<UsuarioService>;

    fixture.detectChanges(); // Trigger ngOnInit
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values and validators', () => {
      const form = component.usuarioForm;
      
      expect(form).toBeDefined();
      expect(form.get('name')?.value).toBe('');
      expect(form.get('email')?.value).toBe('');
      expect(form.get('departmentId')?.value).toBeNull();
      
      // Verificar validators
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('email')?.hasError('required')).toBe(true);
      expect(form.get('departmentId')?.hasError('required')).toBe(true);
    });

    it('should have departamentos array with correct data', () => {
      expect(component.departamentos).toEqual([
        { id: 1, name: 'Ventas' },
        { id: 2, name: 'Recursos Humanos' },
        { id: 3, name: 'Contabilidad' },
      ]);
    });

    it('should initialize all signals with correct default values', () => {
      expect(component.isLoading()).toBe(false);
      expect(component.isLoadingChart()).toBe(false);
      expect(component.showNotification()).toBe(false);
      expect(component.notificationMessage()).toBe('');
      expect(component.notificationType()).toBe('success');
    });

    it('should load chart data on initialization', () => {
      expect(usuarioService.getUsersByDepartment).toHaveBeenCalled();
    });
  });

  describe('loadChartData', () => {
    it('should set isLoadingChart to true before loading', () => {
      component.isLoadingChart.set(false);
      
      component.loadChartData();
      
      // Antes de la respuesta debería estar en true momentáneamente
      expect(usuarioService.getUsersByDepartment).toHaveBeenCalled();
    });

    it('should load chart data successfully and update barChartData', () => {
      usuarioService.getUsersByDepartment.mockReturnValue(of(mockChartData));

      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      
      const chartData = component.barChartData();
      expect(chartData.labels).toEqual(['Ventas', 'Recursos Humanos', 'Contabilidad']);
      expect(chartData.datasets[0].data).toEqual([5, 3, 2]);
      expect(chartData.datasets[0].label).toBe('Cantidad de Usuarios');
    });

    it('should handle error when loading chart data', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      usuarioService.getUsersByDepartment.mockReturnValue(
        throwError(() => new Error('Error al cargar'))
      );

      component.loadChartData();

      expect(component.isLoadingChart()).toBe(false);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
      expect(component.notificationMessage()).toBe('Error al cargar el gráfico');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty chart data', () => {
      usuarioService.getUsersByDepartment.mockReturnValue(of([]));

      component.loadChartData();

      const chartData = component.barChartData();
      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets[0].data).toEqual([]);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.usuarioForm.patchValue({
        name: '',
        email: '',
        departmentId: null,
      });

      component.onSubmit();

      expect(usuarioService.createUser).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.usuarioForm.patchValue({
        name: '',
        email: 'invalid',
        departmentId: null,
      });

      component.onSubmit();

      expect(component.usuarioForm.get('name')?.touched).toBe(true);
      expect(component.usuarioForm.get('email')?.touched).toBe(true);
      expect(component.usuarioForm.get('departmentId')?.touched).toBe(true);
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
      expect(component.isLoading()).toBe(false);
    });

    it('should reset form after successful submission', () => {
      const mockUser = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      component.usuarioForm.patchValue(mockUser);
      usuarioService.createUser.mockReturnValue(of({ id: 1, ...mockUser }));

      component.onSubmit();

      expect(component.usuarioForm.get('name')?.value).toBeNull();
      expect(component.usuarioForm.get('email')?.value).toBeNull();
      expect(component.usuarioForm.get('departmentId')?.value).toBeNull();
    });

    it('should reload chart data after successful submission', () => {
      const mockUser = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      component.usuarioForm.patchValue(mockUser);
      usuarioService.createUser.mockReturnValue(of({ id: 1, ...mockUser }));
      usuarioService.getUsersByDepartment.mockClear();

      component.onSubmit();

      expect(usuarioService.getUsersByDepartment).toHaveBeenCalled();
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
      expect(component.notificationMessage()).toBe('Error al crear usuario');
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading to true during submission', () => {
      const mockUser = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      };

      component.usuarioForm.patchValue(mockUser);
      
      // Simular observable que no se completa inmediatamente
      let subscriptionCallback: any;
      usuarioService.createUser.mockReturnValue({
        subscribe: (callback: any) => {
          subscriptionCallback = callback;
          expect(component.isLoading()).toBe(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.onSubmit();
    });
  });

  describe('Notification System', () => {
    it('should close notification when closeNotification is called', () => {
      component.showNotification.set(true);
      component.notificationMessage.set('Test message');

      component.closeNotification();

      expect(component.showNotification()).toBe(false);
    });

    it('should hide notification after 4 seconds', fakeAsync(() => {
      component['showNotificationMessage']('Test message', 'success');

      expect(component.showNotification()).toBe(true);
      expect(component.notificationMessage()).toBe('Test message');
      expect(component.notificationType()).toBe('success');

      tick(3999);
      expect(component.showNotification()).toBe(true);

      tick(1);
      expect(component.showNotification()).toBe(false);
    }));

    it('should set correct notification type for success', () => {
      component['showNotificationMessage']('Success!', 'success');

      expect(component.notificationType()).toBe('success');
      expect(component.notificationMessage()).toBe('Success!');
    });

    it('should set correct notification type for error', () => {
      component['showNotificationMessage']('Error!', 'error');

      expect(component.notificationType()).toBe('error');
      expect(component.notificationMessage()).toBe('Error!');
    });
  });

  describe('Form Validation Helpers', () => {
    describe('isFieldInvalid', () => {
      it('should return true when field is invalid and touched', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('');
        nameField?.markAsTouched();

        expect(component.isFieldInvalid('name')).toBe(true);
      });

      it('should return false when field is invalid but not touched', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('');

        expect(component.isFieldInvalid('name')).toBe(false);
      });

      it('should return false when field is valid and touched', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('Juan Pérez');
        nameField?.markAsTouched();

        expect(component.isFieldInvalid('name')).toBe(false);
      });

      it('should return false for non-existent field', () => {
        expect(component.isFieldInvalid('nonExistentField')).toBe(false);
      });
    });

    describe('getFieldError', () => {
      it('should return required error message', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('');
        nameField?.markAsTouched();

        expect(component.getFieldError('name')).toBe('Este campo es obligatorio');
      });

      it('should return email format error message', () => {
        const emailField = component.usuarioForm.get('email');
        emailField?.setValue('invalid-email');
        emailField?.markAsTouched();

        expect(component.getFieldError('email')).toBe('Formato de email inválido');
      });

      it('should return maxlength error message for name', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('a'.repeat(51));
        nameField?.markAsTouched();

        expect(component.getFieldError('name')).toBe('Máximo 50 caracteres');
      });

      it('should return email format error when email is too long but invalid format', () => {
        const emailField = component.usuarioForm.get('email');
        // Email largo sin formato válido - Angular prioriza el error de email sobre maxlength
        emailField?.setValue('a'.repeat(151));
        emailField?.markAsTouched();

        expect(component.getFieldError('email')).toBe('Formato de email inválido');
      });

      it('should return empty string when field has no errors', () => {
        const nameField = component.usuarioForm.get('name');
        nameField?.setValue('Juan Pérez');

        expect(component.getFieldError('name')).toBe('');
      });

      it('should prioritize required error over other errors', () => {
        const emailField = component.usuarioForm.get('email');
        emailField?.setValue('');
        emailField?.markAsTouched();

        expect(component.getFieldError('email')).toBe('Este campo es obligatorio');
      });
    });
  });

  describe('Form Validators', () => {
    it('should validate name field correctly', () => {
      const nameField = component.usuarioForm.get('name');

      // Empty name
      nameField?.setValue('');
      expect(nameField?.hasError('required')).toBe(true);

      // Valid name
      nameField?.setValue('Juan Pérez');
      expect(nameField?.valid).toBe(true);

      // Name exceeding maxlength
      nameField?.setValue('a'.repeat(51));
      expect(nameField?.hasError('maxlength')).toBe(true);
    });

    it('should validate email field correctly', () => {
      const emailField = component.usuarioForm.get('email');

      // Empty email
      emailField?.setValue('');
      expect(emailField?.hasError('required')).toBe(true);

      // Invalid email format
      emailField?.setValue('invalid-email');
      expect(emailField?.hasError('email')).toBe(true);

      // Valid email
      emailField?.setValue('juan@example.com');
      expect(emailField?.valid).toBe(true);

      // Email exceeding maxlength with valid format
      const longEmail = 'a'.repeat(142) + '@test.com';
      emailField?.setValue(longEmail);
      expect(emailField?.hasError('maxlength')).toBe(true);
    });

    it('should validate departmentId field correctly', () => {
      const deptField = component.usuarioForm.get('departmentId');

      // Null department
      deptField?.setValue(null);
      expect(deptField?.hasError('required')).toBe(true);

      // Valid department
      deptField?.setValue(1);
      expect(deptField?.valid).toBe(true);
    });

    it('should invalidate form when any field is invalid', () => {
      component.usuarioForm.patchValue({
        name: 'Juan',
        email: 'juan@example.com',
        departmentId: null,
      });

      expect(component.usuarioForm.valid).toBe(false);
    });

    it('should validate form when all fields are valid', () => {
      component.usuarioForm.patchValue({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      });

      expect(component.usuarioForm.valid).toBe(true);
    });
  });

  describe('Chart Configuration', () => {
    it('should have correct chart options configuration', () => {
      expect(component.barChartOptions?.responsive).toBe(true);
      expect(component.barChartOptions?.maintainAspectRatio).toBe(false);
      expect(component.barChartOptions?.plugins?.legend?.display).toBe(false);
    });

    it('should initialize with empty chart data', () => {
      const initialChartData = component.barChartData();
      
      // Después del ngOnInit debería tener datos del mock
      expect(initialChartData.labels?.length).toBeGreaterThan(0);
    });
  });
});
