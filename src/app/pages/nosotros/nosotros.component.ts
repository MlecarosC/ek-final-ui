import { Component } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  imports: [],
  templateUrl: './nosotros.component.html',
})
export class NosotrosComponent {
  readonly photoUrl = '/images/me.jpg';
  readonly photoAlt = 'Martin Lecaros';

  onImageRightClick(event: MouseEvent): boolean {
    event.preventDefault();
    return false;
  }
}