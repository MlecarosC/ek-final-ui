import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UsuarioService } from '../../core/services/usuario.service';
import { CreateUsuarioDto } from '../../shared/models/usuario.model';
import { UsuariosByDepartment } from '../../shared/models/usuarioByDepartment.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  // Signals
  isLoading = signal(false);
  isLoadingChart = signal(true);
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  // Form
  usuarioForm!: FormGroup;

  // Departamentos
  readonly departamentos = [
    { id: 1, name: 'Ventas' },
    { id: 2, name: 'Recursos Humanos' },
    { id: 3, name: 'Contabilidad' }
  ];

  // Chart config
  barChartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{
        data: [],
        label: 'Cantidad de Usuarios',
        backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
        ]
        }]
    });

    barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
        display: false
        },
        tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: {
            size: 16,
            weight: 'bold'
        },
        bodyFont: {
            size: 14
        },
        padding: 16,
        cornerRadius: 8,
        callbacks: {
            label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} usuario${value !== 1 ? 's' : ''}`;
            }
        }
        }
    },
    scales: {
        x: {
        ticks: {
            color: '#1f2937',  // ← Color oscuro visible
            font: {
            size: 14,
            weight: 'bold'
            }
        },
            grid: {
                display: false
            },
        },
        y: {
        beginAtZero: true,
        ticks: {
            color: '#1f2937',  // ← Color oscuro visible
            font: {
            size: 14,
            weight: 'bold'
            },
            stepSize: 5,
            precision: 0
        },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'  // ← Líneas sutiles pero visibles
            },
        }
    }
    };

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      departmentId: [null, [Validators.required]]
    });
  }

  loadChartData(): void {
    this.isLoadingChart.set(true);
    
    this.usuarioService.getUsersByDepartment().subscribe({
      next: (data: UsuariosByDepartment[]) => {
        this.updateChartData(data);
        this.isLoadingChart.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos del gráfico:', error);
        this.showNotificationMessage('Error al cargar el gráfico', 'error');
        this.isLoadingChart.set(false);
      }
    });
  }

  private updateChartData(data: UsuariosByDepartment[]): void {
    const labels = data.map(d => d.departmentName);
    const counts = data.map(d => d.userCount);

    this.barChartData.set({
      labels,
      datasets: [{
        data: counts,
        label: 'Cantidad de Usuarios',
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ]
      }]
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue: CreateUsuarioDto = this.usuarioForm.value;

    this.usuarioService.createUser(formValue).subscribe({
      next: (response) => {
        this.showNotificationMessage('¡Usuario agregado con éxito!', 'success');
        this.usuarioForm.reset();
        this.loadChartData();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.showNotificationMessage(error.message, 'error');
        this.isLoading.set(false);
      }
    });
  }

  private showNotificationMessage(message: string, type: 'success' | 'error'): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);

    setTimeout(() => {
      this.showNotification.set(false);
    }, 4000);
  }

  closeNotification(): void {
    this.showNotification.set(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('email')) {
      return 'Formato de email inválido';
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    return '';
  }
}
