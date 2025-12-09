import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly logoUrl = '/images/logo.png';
  readonly menuItems = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Usuarios', route: '/usuarios' },
    { label: 'Nosotros', route: '/nosotros' }
  ];

  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onImageRightClick(event: MouseEvent): boolean {
    event.preventDefault();
    return false;
  }
}