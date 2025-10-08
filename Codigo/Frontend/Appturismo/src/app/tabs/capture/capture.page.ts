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
  rating?: number;
  imagen: string;
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
    // ESPAÑA - Barcelona
    {
      nombre: 'Sagrada Familia',
      ciudad: 'Barcelona',
      pais: 'España',
      categoria: 'Monumento',
      descripcion: 'Basílica diseñada por Antoni Gaudí, obra maestra del modernismo catalán.',
      horario: '9:00 - 18:00',
      direccion: 'Carrer de Mallorca, 401',
      precio: 'Desde €20',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1583422409516-289917ce5991?w=400'
    },
    {
      nombre: 'Parque Güell',
      ciudad: 'Barcelona', 
      pais: 'España',
      categoria: 'Parque',
      descripcion: 'Parque público con jardines y elementos arquitectónicos diseñados por Gaudí.',
      horario: '9:30 - 19:30',
      direccion: '08024 Barcelona',
      precio: '€10',
      rating: 4.6,
      imagen: 'https://images.unsplash.com/photo-1592478411180-3d7b9c80e04f?w=400'
    },
    {
      nombre: 'La Rambla',
      ciudad: 'Barcelona',
      pais: 'España', 
      categoria: 'Avenida',
      descripcion: 'Famosa avenida peatonal en el corazón de Barcelona, llena de vida y comercios.',
      horario: 'Acceso 24 horas',
      direccion: 'La Rambla, Barcelona',
      rating: 4.4,
      imagen: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=400'
    },
    {
      nombre: 'Casa Batlló',
      ciudad: 'Barcelona',
      pais: 'España',
      categoria: 'Arquitectura',
      descripcion: 'Obra maestra de Gaudí con fachada modernista y diseño orgánico.',
      horario: '9:00 - 20:00',
      direccion: 'Passeig de Gràcia, 43',
      precio: '€35',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1558626296-97e6c0c73f8a?w=400'
    },

    // ESPAÑA - Madrid
    {
      nombre: 'Palacio Real',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Palacio',
      descripcion: 'Residencia oficial del Rey de España, con impresionantes salones y jardines.',
      horario: '10:00 - 18:00',
      direccion: 'Calle de Bailén, s/n',
      precio: '€12',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=400'
    },
    {
      nombre: 'Museo del Prado',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Museo', 
      descripcion: 'Uno de los museos más importantes del mundo, con obras de Goya, Velázquez y El Greco.',
      horario: '10:00 - 20:00',
      direccion: 'C. de Ruiz de Alarcón, 23',
      precio: '€15',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1590047891338-82d4cec46d67?w=400'
    },
    {
      nombre: 'Parque del Retiro',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Parque',
      descripcion: 'Pulmón verde de Madrid con el Palacio de Cristal y estanque para botes.',
      horario: '6:00 - 22:00',
      direccion: 'Plaza de la Independencia, 7',
      precio: 'Gratis',
      rating: 4.6,
      imagen: 'https://images.unsplash.com/photo-1578632749014-ca77eb051d3e?w=400'
    },

    // FRANCIA - París
    {
      nombre: 'Torre Eiffel',
      ciudad: 'París', 
      pais: 'Francia',
      categoria: 'Monumento',
      descripcion: 'Icono de Francia y uno de los monumentos más visitados del mundo.',
      horario: '9:00 - 00:45',
      direccion: 'Champ de Mars, 5 Avenue Anatole France',
      precio: 'Desde €16',
      rating: 4.9,
      imagen: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400'
    },
    {
      nombre: 'Louvre',
      ciudad: 'París',
      pais: 'Francia',
      categoria: 'Museo',
      descripcion: 'El museo más grande del mundo, hogar de la Mona Lisa y Venus de Milo.',
      horario: '9:00 - 18:00',
      direccion: 'Rue de Rivoli, 75001 Paris',
      precio: '€17',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1594646147286-322966ccba13?w=400'
    },
    {
      nombre: 'Arco del Triunfo',
      ciudad: 'París',
      pais: 'Francia',
      categoria: 'Monumento',
      descripcion: 'Uno de los monumentos más famosos de París, con vistas panorámicas.',
      horario: '10:00 - 23:00',
      direccion: 'Place Charles de Gaulle',
      precio: '€13',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'
    },

    // ITALIA - Roma
    {
      nombre: 'Coliseo',
      ciudad: 'Roma',
      pais: 'Italia',
      categoria: 'Monumento',
      descripcion: 'Anfiteatro flavio de la época del Imperio romano, icono de Roma.',
      horario: '8:30 - 19:15',
      direccion: 'Piazza del Colosseo, 1',
      precio: '€16',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400'
    },
    {
      nombre: 'Fontana di Trevi',
      ciudad: 'Roma',
      pais: 'Italia',
      categoria: 'Fuente',
      descripcion: 'La fuente más grande y famosa de Roma, conocida por la tradición de la moneda.',
      horario: '24 horas',
      direccion: 'Piazza di Trevi',
      precio: 'Gratis',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1555993537-06271a17d3c6?w=400'
    },

    // JAPÓN - Tokio
    {
      nombre: 'Senso-ji',
      ciudad: 'Tokio',
      pais: 'Japón',
      categoria: 'Templo',
      descripcion: 'Templo budista más antiguo de Tokio, en el barrio de Asakusa.',
      horario: '6:00 - 17:00',
      direccion: '2 Chome-3-1 Asakusa, Taito City',
      precio: 'Gratis',
      rating: 4.5,
      imagen: 'https://images.unsplash.com/photo-1542053027663-5731b217fe06?w=400'
    },
    {
      nombre: 'Shibuya Crossing',
      ciudad: 'Tokio',
      pais: 'Japón',
      categoria: 'Atracción',
      descripcion: 'El cruce peatonal más famoso del mundo, símbolo de Tokio moderno.',
      horario: '24 horas',
      direccion: 'Shibuya, Tokio',
      precio: 'Gratis',
      rating: 4.6,
      imagen: 'https://images.unsplash.com/photo-1540959733332-8ab43a6d0e7a?w=400'
    },

    // ARGENTINA - Buenos Aires
    {
      nombre: 'Obelisco',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      categoria: 'Monumento',
      descripcion: 'Símbolo icónico de Buenos Aires en la intersección de Av. 9 de Julio y Corrientes.',
      horario: 'Visible 24 horas',
      direccion: 'Av. 9 de Julio s/n',
      rating: 4.3,
      imagen: 'https://images.unsplash.com/photo-1582738412126-1ff8e0aaddc6?w=400'
    },
    {
      nombre: 'Caminito',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      categoria: 'Calle Museo',
      descripcion: 'Famoso paseo callejero en La Boca, conocido por sus coloridas casas y arte callejero.',
      horario: '24 horas',
      direccion: 'Caminito, La Boca',
      rating: 4.2,
      imagen: 'https://images.unsplash.com/photo-1578326457399-7a1e8b83a34c?w=400'
    },
    {
      nombre: 'Teatro Colón',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      categoria: 'Teatro',
      descripcion: 'Uno de los teatros de ópera más importantes del mundo, con acústica excepcional.',
      horario: '9:00 - 17:00',
      direccion: 'Cerrito 628',
      precio: 'Desde €10',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1577216874553-88e1c4ba1a44?w=400'
    }
  ];

  // Lugares populares en Barcelona (para mostrar ubicación actual)
  lugaresPopulares: Lugar[] = this.todosLosLugares.filter(lugar => 
    lugar.ciudad === 'Barcelona'
  ).slice(0, 4);

  constructor(private navCtrl: NavController) {}

  /**
   * Filtrar lugares según el término de búsqueda
   */
  filtrarLugares(): void {
    if (!this.terminoBusqueda.trim()) {
      this.lugaresFiltrados = [];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    
    this.lugaresFiltrados = this.todosLosLugares.filter(lugar =>
      lugar.ciudad.toLowerCase().includes(termino) ||
      lugar.pais.toLowerCase().includes(termino) ||
      lugar.nombre.toLowerCase().includes(termino) ||
      lugar.categoria.toLowerCase().includes(termino) ||
      lugar.descripcion.toLowerCase().includes(termino)
    );

    // Ordenar por rating (opcional)
    this.lugaresFiltrados.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * Seleccionar lugar de la lista popular
   */
  seleccionarLugar(nombreLugar: string): void {
    this.terminoBusqueda = nombreLugar;
    this.filtrarLugares();
    
    // Scroll suave a los resultados después de un breve delay
    setTimeout(() => {
      const element = document.querySelector('.results-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Navegar a la página de reseñas del lugar seleccionado
   */
  irAResenas(lugar: Lugar): void {
    console.log('Navegando a reseñas de:', lugar.nombre);
    
    this.navCtrl.navigateForward(`/tabs/health?lugar=${encodeURIComponent(lugar.nombre)}`, {
      state: {
        lugar: lugar
      }
    });
  }

  /**
   * Limpiar búsqueda y mostrar lugares populares
   */
  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.lugaresFiltrados = [];
  }

  /**
   * Obtener lugares por ciudad
   */
  obtenerLugaresPorCiudad(ciudad: string): Lugar[] {
    return this.todosLosLugares.filter(lugar => 
      lugar.ciudad.toLowerCase() === ciudad.toLowerCase()
    );
  }

  /**
   * Obtener lugares por categoría
   */
  obtenerLugaresPorCategoria(categoria: string): Lugar[] {
    return this.todosLosLugares.filter(lugar => 
      lugar.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  /**
   * Obtener lugares destacados (mejor rating)
   */
  obtenerLugaresDestacados(limite: number = 5): Lugar[] {
    return this.todosLosLugares
      .filter(lugar => lugar.rating && lugar.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limite);
  }

  /**
   * Lifecycle hook - Se ejecuta cuando la página carga
   */
  ionViewDidEnter(): void {
    console.log('Página de lugares cargada');
    
    // Opcional: Cargar ubicación real del usuario aquí
    // this.cargarUbicacionUsuario();
  }

  /**
   * Método para futura integración con GPS
   */
  private cargarUbicacionUsuario(): void {
    // Aquí iría la integración con la API de geolocalización
    console.log('Cargando ubicación del usuario...');
    
    // Ejemplo de cómo se implementaría:
    /*
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Ubicación obtenida:', lat, lng);
          // Aquí llamarías a tu API para obtener lugares cercanos
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Fallback a Barcelona como ubicación por defecto
          this.terminoBusqueda = 'Barcelona';
          this.filtrarLugares();
        }
      );
    }
    */
  }
}