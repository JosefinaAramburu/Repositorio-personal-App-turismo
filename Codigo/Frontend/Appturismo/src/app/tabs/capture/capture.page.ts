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
  imagen: string | null; // CAMBIADO A string | null
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

  // Base de datos completa de lugares con imágenes corregidas
  todosLosLugares: Lugar[] = [
    // ESPAÑA - Barcelona
    {
       nombre: 'Sagrada Familia',
  ciudad: 'Barcelona',
  pais: 'España',
  categoria: 'Monumento',
  descripcion: 'Basílica diseñada por Antoni Gaudí, obra maestra del modernismo catalán. Una experiencia arquitectónica única en el mundo.',
  horario: '9:00 - 18:00',
  direccion: 'Carrer de Mallorca, 401',
  precio: 'Desde €20',
  rating: 4.8,
  imagen: "https://cdn-imgix.headout.com/mircobrands-content/image/0cdbae4b3e7ca1bfdcc811483dbd26e3-Sagrada%20Familia%20-%20Gaudi's%20Barcelona.jpeg?auto=format&w=1069.6000000000001&h=687.6&q=90&ar=14%3A9&crop=faces&fit=crop"
}, 
{
      nombre: 'Parque Güell',
      ciudad: 'Barcelona', 
      pais: 'España',
      categoria: 'Parque',
      descripcion: 'Parque público con jardines y elementos arquitectónicos diseñados por Gaudí. Vistas panorámicas de la ciudad.',
      horario: '9:30 - 19:30',
      direccion: '08024 Barcelona',
      precio: '€10',
      rating: 4.6,
      imagen: 'https://images.unsplash.com/photo-1592478411180-3d7b9c80e04f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    {
      nombre: 'La Rambla',
      ciudad: 'Barcelona',
      pais: 'España', 
      categoria: 'Avenida',
      descripcion: 'Famosa avenida peatonal en el corazón de Barcelona, llena de vida, comercios y artistas callejeros.',
      horario: 'Acceso 24 horas',
      direccion: 'La Rambla, Barcelona',
      rating: 4.4,
      imagen: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    {
      nombre: 'Casa Batlló',
      ciudad: 'Barcelona',
      pais: 'España',
      categoria: 'Arquitectura',
      descripcion: 'Obra maestra de Gaudí con fachada modernista y diseño orgánico inspirado en la naturaleza.',
      horario: '9:00 - 20:00',
      direccion: 'Passeig de Gràcia, 43',
      precio: '€35',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1558626296-97e6c0c73f8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },

    // ESPAÑA - Madrid
    {
      nombre: 'Palacio Real',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Palacio',
      descripcion: 'Residencia oficial del Rey de España, con impresionantes salones y jardines. El palacio real más grande de Europa.',
      horario: '10:00 - 18:00',
      direccion: 'Calle de Bailén, s/n',
      precio: '€12',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    {
      nombre: 'Museo del Prado',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Museo', 
      descripcion: 'Uno de los museos más importantes del mundo, con obras de Goya, Velázquez, El Greco y otros maestros.',
      horario: '10:00 - 20:00',
      direccion: 'C. de Ruiz de Alarcón, 23',
      precio: '€15',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1590047891338-82d4cec46d67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    {
      nombre: 'Parque del Retiro',
      ciudad: 'Madrid',
      pais: 'España',
      categoria: 'Parque',
      descripcion: 'Pulmón verde de Madrid con el Palacio de Cristal, estanque para botes y numerosos jardines.',
      horario: '6:00 - 22:00',
      direccion: 'Plaza de la Independencia, 7',
      precio: 'Gratis',
      rating: 4.6,
      imagen: 'https://images.unsplash.com/photo-1578632749014-ca77eb051d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },

    // FRANCIA - París
    {
      nombre: 'Torre Eiffel',
      ciudad: 'París', 
      pais: 'Francia',
      categoria: 'Monumento',
      descripcion: 'Icono de Francia y uno de los monumentos más visitados del mundo. Vistas espectaculares de París.',
      horario: '9:00 - 00:45',
      direccion: 'Champ de Mars, 5 Avenue Anatole France',
      precio: 'Desde €16',
      rating: 4.9,
      imagen: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    {
      nombre: 'Museo del Louvre',
      ciudad: 'París',
      pais: 'Francia',
      categoria: 'Museo',
      descripcion: 'El museo más grande del mundo, hogar de la Mona Lisa, Venus de Milo y miles de obras maestras.',
      horario: '9:00 - 18:00',
      direccion: 'Rue de Rivoli, 75001 Paris',
      precio: '€17',
      rating: 4.8,
      imagen: 'https://images.unsplash.com/photo-1594646147286-322966ccba13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },

    // ITALIA - Roma
    {
      nombre: 'Coliseo Romano',
      ciudad: 'Roma',
      pais: 'Italia',
      categoria: 'Monumento',
      descripcion: 'Anfiteatro flavio de la época del Imperio romano, icono histórico de Roma y del mundo antiguo.',
      horario: '8:30 - 19:15',
      direccion: 'Piazza del Colosseo, 1',
      precio: '€16',
      rating: 4.7,
      imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
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
      imagen: 'https://images.unsplash.com/photo-1582738412126-1ff8e0aaddc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
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

    // Ordenar por rating (mejores primero)
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
   * Manejar error de carga de imagen - CORREGIDO
   */
  manejarErrorImagen(lugar: Lugar): void {
    console.log('Error cargando imagen para:', lugar.nombre);
    lugar.imagen = ''; // Asignar string vacío en lugar de null
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
   * Obtener categorías únicas disponibles
   */
  obtenerCategoriasUnicas(): string[] {
    const categorias = this.todosLosLugares.map(lugar => lugar.categoria);
    return [...new Set(categorias)].sort();
  }

  /**
   * Obtener ciudades únicas disponibles
   */
  obtenerCiudadesUnicas(): string[] {
    const ciudades = this.todosLosLugares.map(lugar => lugar.ciudad);
    return [...new Set(ciudades)].sort();
  }

  /**
   * Obtener países únicos disponibles
   */
  obtenerPaisesUnicos(): string[] {
    const paises = this.todosLosLugares.map(lugar => lugar.pais);
    return [...new Set(paises)].sort();
  }

  /**
   * Verificar si hay resultados de búsqueda
   */
  get hayResultados(): boolean {
    return this.lugaresFiltrados.length > 0;
  }

  /**
   * Verificar si se está mostrando búsqueda
   */
  get mostrandoBusqueda(): boolean {
    return this.terminoBusqueda.trim().length > 0;
  }

  /**
   * Lifecycle hook - Se ejecuta cuando la página carga
   */
  ionViewDidEnter(): void {
    console.log('Página de lugares cargada');
    console.log('Lugares populares:', this.lugaresPopulares.length);
    console.log('Total de lugares:', this.todosLosLugares.length);
    
    // Opcional: Cargar ubicación real del usuario aquí
    // this.cargarUbicacionUsuario();
  }

  /**
   * Lifecycle hook - Cuando la página sale
   */
  ionViewWillLeave(): void {
    console.log('Saliendo de la página de lugares');
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
        }
      );
    }
    */
  }

  /**
   * Obtener sugerencias de búsqueda basadas en el término actual
   */
  obtenerSugerenciasBusqueda(): string[] {
    if (!this.terminoBusqueda.trim()) {
      return [];
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    const sugerencias: string[] = [];

    // Sugerir ciudades
    this.obtenerCiudadesUnicas().forEach(ciudad => {
      if (ciudad.toLowerCase().includes(termino)) {
        sugerencias.push(ciudad);
      }
    });

    // Sugerir categorías
    this.obtenerCategoriasUnicas().forEach(categoria => {
      if (categoria.toLowerCase().includes(termino)) {
        sugerencias.push(categoria);
      }
    });

    // Sugerir países
    this.obtenerPaisesUnicos().forEach(pais => {
      if (pais.toLowerCase().includes(termino)) {
        sugerencias.push(pais);
      }
    });

    return sugerencias.slice(0, 5); // Máximo 5 sugerencias
  }

  /**
   * Obtener estadísticas de los lugares
   */
  obtenerEstadisticas(): { total: number, porCiudad: { [ciudad: string]: number }, porCategoria: { [categoria: string]: number } } {
    const porCiudad: { [ciudad: string]: number } = {};
    const porCategoria: { [categoria: string]: number } = {};

    this.todosLosLugares.forEach(lugar => {
      porCiudad[lugar.ciudad] = (porCiudad[lugar.ciudad] || 0) + 1;
      porCategoria[lugar.categoria] = (porCategoria[lugar.categoria] || 0) + 1;
    });

    return {
      total: this.todosLosLugares.length,
      porCiudad,
      porCategoria
    };
  }
}