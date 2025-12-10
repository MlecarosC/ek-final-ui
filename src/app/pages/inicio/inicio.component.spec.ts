import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InicioComponent } from './inicio.component';
import { By } from '@angular/platform-browser';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Gestión Inteligente de Equipos');
  });

  it('should render description text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const description = compiled.querySelector('p');
    expect(description?.textContent).toContain('Centraliza la administración de usuarios');
  });

  it('should have a button with correct routerLink', () => {
    const button = fixture.debugElement.query(By.css('button[routerLink]'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Ver Distribución');
  });

  it('should have hero class on main div', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroDiv = compiled.querySelector('.hero');
    expect(heroDiv).toBeTruthy();
  });
});
