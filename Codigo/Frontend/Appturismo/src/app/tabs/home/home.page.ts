import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],          // 👈 NECESARIO para cargar tu SCSS
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      destino: ['', Validators.required],
    });
  }

  buscar() {
    const destino = this.form.value.destino?.trim();
    if (!destino) return;

    // Aquí haces lo que quieras con el destino (guardar en estado, query param, etc.)
    // Ejemplo: enviar a eventos con el destino como query param
    this.router.navigate(['/tabs', 'eventos'], { queryParams: { q: destino } });
  }

  goTo(tab: 'events' | 'places' | 'food') {
    switch (tab) {
      case 'events':
        this.router.navigate(['/tabs', 'eventos']);
        break;
      case 'places':
        // si tu ruta real es "capture" para lugares, déjalo así:
        this.router.navigate(['/tabs', 'capture']);
        break;
      case 'food':
        this.router.navigate(['/tabs', 'gastronomia']);
        break;
    }
  }
}