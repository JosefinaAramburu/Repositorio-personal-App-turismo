import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database';
import { IonicModule, IonIcon } from '@ionic/angular';




@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
imports: [CommonModule, FormsModule, IonicModule]
}
)
export class StatsPage implements OnInit {
  filtro = '';
  eventos = [
    {
      nombre: 'Concierto de música clásica',
      tipo: 'Música',
      fecha: 'jueves, 23 de mayo',
      lugar: 'Palau de la Música Catalana',
    },
    {
      nombre: 'Feria de libros',
      tipo: 'Libros',
      fecha: 'viernes, 24 al domingo, 26 de mayo',
      lugar: 'Fira de Barcelona',
    },
    {
      nombre: 'Fiesta de la cerveza',
      tipo: 'Cerveza',
      fecha: 'sábado, 25 de mayo',
      lugar: 'Jardines de la Ciutadella',
    },
    {
      nombre: 'Festival gastronómico',
      tipo: 'Festival',
      fecha: 'domingo, 26 de mayo',
      lugar: 'Plaza Mayor',
    },
  ];


  ngOnInit() {}


  eventosFiltrados() {
    return this.eventos.filter(e =>
      e.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      e.tipo.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }


  getIcon(tipo: string): string {
    const t = tipo.toLowerCase();
    if (t.includes('música')) return 'musical-notes-outline';
    if (t.includes('libro')) return 'book-outline';
    if (t.includes('cerveza')) return 'beer-outline';
    if (t.includes('festival')) return 'restaurant-outline';
    // Alternativos (podés usarlos si agregás otros eventos)
    if (t.includes('paseo')) return 'walk-outline';
    if (t.includes('local')) return 'storefront-outline';
    if (t.includes('fogón') || t.includes('noche')) return 'bonfire-outline';
    return 'calendar-outline';
  }


  getColor(tipo: string): string {
    const t = tipo.toLowerCase();
    if (t.includes('música')) return 'music';
    if (t.includes('libro')) return 'books';
    if (t.includes('cerveza')) return 'beer';
    if (t.includes('festival')) return 'festival';
    return '';
  }
}

