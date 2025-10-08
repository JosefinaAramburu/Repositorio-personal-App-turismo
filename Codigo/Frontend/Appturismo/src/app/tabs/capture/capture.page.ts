import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

interface Lugar {
  nombre: string;
  ciudad: string;
  pais: string;
  categoria: string;
  descripcion: string;
  horario: string;
  direccion?: string;
  precio?: string;
  coordenadas?: string;
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CapturePage {
  terminoBusqueda: string = '';
  lugaresFiltrados: Lugar[] = [];

  // Base de datos completa de lugares
  todosLosLugares: Lugar[] = [
    // BARCELONA
    {
      nombre: 'Sagrada Familia',
      ciudad: 'Barcelona',
      pais: 'España',
      categoria: 'Monumento',
      descripcion: 'Basílica diseñada por Antoni Gaudí, obra maestra del modernismo catalán.',
      horario: '9:00 - 18:00',
      direccion: 'Carrer de Mallorca, 401',
      precio: 'Desde €20'
    },
    {
      nombre: 'Parque Güell',
      ciudad: 'Barcelona', 
      pais: 'España',
      categoria: 'Parque',
      descripcion: 'Parque público con jardines y elementos arquitectónicos diseñados por Gaudí.',
      horario: '9:30 - 19:30',
      direccion: '08024 Barcelona',
      precio: '€10'
    },
    {
      nombre: 'La Rambla',
      ciudad: 'Barcelona',
      pais: 'España', 
      categoria: 'Avenida',
      descripcion: 'Famosa avenida peatonal en el corazón de Barcelona, llena de vida y comercios.',
      horario: 'Acceso 24 horas',
      direccion: 'La Rambla, Barcelona'
    },

    // MADRID
    {
      nombre: 'Palacio Real',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Palacio',
      descripcion: 'Residencia oficial del Rey de España, con impresionantes salones y jardines.',
      horario: '10:00 - 18:00',
      direccion: 'Calle de Bailén, s/n',
      precio: '€12'
    },
    {
      nombre: 'Museo del Prado',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Museo', 
      descripcion: 'Uno de los museos más importantes del mundo, con obras de Goya, Velázquez y El Greco.',
      horario: '10:00 - 20:00',
      direccion: 'C. de Ruiz de Alarcón, 23',
      precio: '€15'
    },

    // BUENOS AIRES
    {
      nombre: 'Obelisco',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      categoria: 'Monumento',
      descripcion: 'Símbolo icónico de Buenos Aires en la intersección de Av. 9 de Julio y Corrientes.',
      horario: 'Visible 24 horas',
      direccion: 'Av. 9 de Julio s/n'
    },
    {
      nombre: 'Caminito',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      categoria: 'Calle Museo',
      descripcion: 'Famoso paseo callejero en La Boca, conocido por sus coloridas casas y arte callejero.',
      horario: '24 horas',
      direccion: 'Caminito, La Boca'
    },

    // PARÍS
    {
      nombre: 'Torre Eiffel',
      ciudad: 'París', 
      pais: 'Francia',
      categoria: 'Monumento',
      descripcion: 'Icono de Francia y uno de los monumentos más visitados del mundo.',
      horario: '9:00 - 00:45',
      direccion: 'Champ de Mars, 5 Avenue Anatole France',
      precio: 'Desde €16'
    }
  ];

  // Lugares populares para mostrar inicialmente
  lugaresPopulares: Lugar[] = this.todosLosLugares.slice(0, 4);

  constructor(private navCtrl: NavController) {}

  // Filtrar lugares según la búsqueda
  filtrarLugares() {
    if (!this.terminoBusqueda.trim()) {
      this.lugaresFiltrados = [];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.lugaresFiltrados = this.todosLosLugares.filter(lugar =>
      lugar.ciudad.toLowerCase().includes(termino) ||
      lugar.pais.toLowerCase().includes(termino) ||
      lugar.nombre.toLowerCase().includes(termino) ||
      lugar.categoria.toLowerCase().includes(termino)
    );
  }

  // Seleccionar lugar de la lista popular
  seleccionarLugar(nombreLugar: string) {
    this.terminoBusqueda = nombreLugar;
    this.filtrarLugares();
  }

  // Navegar a reseñas (✅ SÍ SIGUE VINCULADO BIEN)
  irAResenas(lugar: Lugar) {
    this.navCtrl.navigateForward(`/tabs/health?lugar=${encodeURIComponent(lugar.nombre)}`);
  }
}