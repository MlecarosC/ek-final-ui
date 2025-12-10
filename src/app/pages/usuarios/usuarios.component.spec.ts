import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
    const usuarioServiceMock = {
      createUser: jest.fn(),
      getUsersByDepartment: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UsuariosComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    usuarioService = TestBed.inject(UsuarioService) as jest.Mocked<UsuarioService>;
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

  it('should have 3 departments', () => {
    expect(component.departamentos.length).toBe(3);
    expect(component.departamentos[0].name).toBe('Ventas');
    expect(component.departamentos[1].name).toBe('Recursos Humanos');
    expect(component.departamentos[2].name).toBe('Contabilidad');
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.usuarioForm.valid).toBeFalsy();
    });

    it('should validate name as required', () => {
      const nameControl = component.usuarioForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.usuarioForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate name max length', () => {
      const nameControl = component.usuarioForm.get('name');
      const longName = 'a'.repeat(51);
      nameControl?.setValue(longName);
      expect(nameControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should validate email max length', () => {
      const emailControl = component.usuarioForm.get('email');
      const longEmail = 'a'.repeat(140) + '@test.com';
      emailControl?.setValue(longEmail);
      expect(emailControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should be valid with correct data', () => {
      component.usuarioForm.patchValue({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      });
      expect(component.usuarioForm.valid).toBeTruthy();
    });
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
      usuarioService.createUser.mockReturnValue(
        of({ id: 1, ...mockUser })
      );
      usuarioService.getUsersByDepartment.mockReturnValue(of(mockChartData));

      component.onSubmit();

      expect(usuarioService.createUser).toHaveBeenCalledWith(mockUser);
      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('success');
      expect(component.notificationMessage()).toBe('¡Usuario agregado con éxito!');
    });

    it('should handle error on submit', () => {
      component.usuarioForm.patchValue({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        departmentId: 1,
      });

      usuarioService.createUser.mockReturnValue(
        throwError(() => new Error('Error al crear usuario'))
      );

      component.onSubmit();

      expect(component.showNotification()).toBe(true);
      expect(component.notificationType()).toBe('error');
    });
  });

  describe('Helper Methods', () => {
    it('should check if field is invalid', () => {
      const nameControl = component.usuarioForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');

      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('should get field error message for required field', () => {
      const nameControl = component.usuarioForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(component.getFieldError('name')).toBe('Este campo es obligatorio');
    });

    it('should get field error message for invalid email', () => {
      const emailControl = component.usuarioForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();

      expect(component.getFieldError('email')).toBe('Formato de email inválido');
    });

    it('should close notification', () => {
      component.showNotification.set(true);
      component.closeNotification();
      expect(component.showNotification()).toBe(false);
    });
  });
});
