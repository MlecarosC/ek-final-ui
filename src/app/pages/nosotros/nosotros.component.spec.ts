import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NosotrosComponent } from './nosotros.component';

describe('NosotrosComponent', () => {
  let component: NosotrosComponent;
  let fixture: ComponentFixture<NosotrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NosotrosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NosotrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct photo URL', () => {
    expect(component.photoUrl).toBe('/images/me.jpg');
  });

  it('should have correct photo alt text', () => {
    expect(component.photoAlt).toBe('Martin Lecaros');
  });

  it('should render title "Sobre el Proyecto"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Sobre el Proyecto');
  });

  it('should render author name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const authorDiv = compiled.querySelector('.text-primary');
    expect(authorDiv?.textContent).toContain('Martin Lecaros');
  });

  it('should prevent context menu on image', () => {
    const event = new MouseEvent('contextmenu');
    const result = component.onImageRightClick(event);
    expect(result).toBe(false);
  });

  it('should render Angular badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.badge');
    const angularBadge = Array.from(badges).find((badge) =>
      badge.textContent?.includes('Angular')
    );
    expect(angularBadge).toBeTruthy();
  });

  it('should render Spring Boot badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.badge');
    const springBadge = Array.from(badges).find((badge) =>
      badge.textContent?.includes('Spring Boot')
    );
    expect(springBadge).toBeTruthy();
  });
});
