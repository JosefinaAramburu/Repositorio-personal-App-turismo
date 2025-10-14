import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';

// Interface local - la puedes poner en el mismo archivo o en el servicio
interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  ciudad: string;
  pais: string;
  categoria: string;
  descripcion: string;
  horario: string;
  precio?: string;
  rating?: number;
  imagen: string | null;
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CapturePage implements OnInit {
  terminoBusqueda: string = '';
  lugaresFiltrados: Lugar[] = [];
  todosLosLugares: Lugar[] = [];
  lugaresPopulares: Lugar[] = [];
  cargando: boolean = true;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.cargarLugares();
  }

  // CARGAR lugares desde Supabase
  async cargarLugares() {
    const loading = await this.loadingController.create({
      message: 'Cargando lugares...',
    });
    await loading.present();

    try {
      // SIMULAMOS carga desde Supabase - luego reemplazarás con el servicio real
      await this.simularCargaSupabase();
      
      await loading.dismiss();
      this.mostrarToast(`${this.todosLosLugares.length} lugares cargados`, 'success');
    } catch (error) {
      await loading.dismiss();
      console.error('Error cargando lugares:', error);
      this.mostrarToast('Error al cargar lugares', 'danger');
      this.usarDatosLocales();
    } finally {
      this.cargando = false;
    }
  }

  // Simulación de carga desde Supabase - REEMPLAZAR con servicio real
  private async simularCargaSupabase() {
    // Esto es temporal - luego usarás this.captureService.obtenerLugares()
    return new Promise(resolve => {
      setTimeout(() => {
        this.todosLosLugares = [
          {
            id_lugares: 1,
            id_destino: 1,
            nombre: 'Sagrada Familia',
            ciudad: 'Barcelona',
            pais: 'España',
            categoria: 'Monumento',
            descripcion: 'Basílica diseñada por Antoni Gaudí, obra maestra del modernismo catalán.',
            horario: '9:00 - 18:00',
            precio: 'Desde €20',
            rating: 4.8,
            imagen: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
          },
          {
            id_lugares: 2,
            id_destino: 1,
            nombre: 'Park Güell',
            ciudad: 'Barcelona',
            pais: 'España',
            categoria: 'Parque',
            descripcion: 'Parque diseñado por Antoni Gaudí con impresionantes vistas de Barcelona.',
            horario: '8:00 - 21:30',
            precio: '€10',
            rating: 4.6,
            imagen: 'https://images.unsplash.com/photo-1562883677-b6e00d308b8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
          },
          {
            id_lugares: 3,
            id_destino: 1,
            nombre: 'Casa Batlló',
            ciudad: 'Barcelona',
            pais: 'España',
            categoria: 'Arquitectura',
            descripcion: 'Obra maestra de Gaudí con fachada modernista y diseño orgánico.',
            horario: '9:00 - 20:00',
            precio: '€35',
            rating: 4.7,
            imagen: 'https://images.unsplash.com/photo-1558642084-5ce0e3bc7b6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
          }
        ];
        
        // Lugares populares (Barcelona)
        this.lugaresPopulares = this.todosLosLugares.slice(0, 2);
        resolve(true);
      }, 1500);
    });
  }

  // Datos locales de respaldo
  private usarDatosLocales() {
    this.todosLosLugares = [
      {
        id_lugares: 1,
        id_destino: 1,
        nombre: 'Sagrada Familia',
        ciudad: 'Barcelona',
        pais: 'España',
        categoria: 'Monumento',
        descripcion: 'Basílica diseñada por Antoni Gaudí.',
        horario: '9:00 - 18:00',
        precio: '€20',
        rating: 4.8,
        imagen: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0'
      }
    ];
    this.lugaresPopulares = this.todosLosLugares;
    this.mostrarToast('Usando datos locales', 'warning');
  }

  // BUSCAR lugares
  filtrarLugares(): void {
    if (!this.terminoBusqueda.trim()) {
      this.lugaresFiltrados = [];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.lugaresFiltrados = this.todosLosLugares.filter(lugar =>
      lugar.nombre.toLowerCase().includes(termino) ||
      lugar.ciudad.toLowerCase().includes(termino) ||
      lugar.categoria.toLowerCase().includes(termino) ||
      lugar.descripcion.toLowerCase().includes(termino)
    );
  }

  // CREATE - Agregar nuevo lugar
  async agregarLugar() {
    const alert = await this.alertController.create({
      header: 'Agregar Lugar',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del lugar*'
        },
        {
          name: 'categoria',
          type: 'text',
          placeholder: 'Categoría*',
          value: 'Monumento'
        },
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción*'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.nombre && data.categoria) {
              await this.guardarNuevoLugar(data);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async guardarNuevoLugar(data: any) {
    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    try {
      // SIMULAMOS guardar en Supabase - luego reemplazarás con servicio real
      await this.simularGuardarEnSupabase(data);
      
      await loading.dismiss();
      this.mostrarToast('Lugar agregado correctamente', 'success');
      await this.cargarLugares(); // Recargar lista
      
    } catch (error) {
      await loading.dismiss();
      this.mostrarToast('Error al guardar lugar', 'danger');
    }
  }

  // Simulación de guardado - REEMPLAZAR con servicio real
  private async simularGuardarEnSupabase(data: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        const nuevoLugar: Lugar = {
          id_lugares: this.todosLosLugares.length + 1,
          id_destino: 1,
          nombre: data.nombre,
          ciudad: 'Barcelona',
          pais: 'España',
          categoria: data.categoria,
          descripcion: data.descripcion || 'Sin descripción',
          horario: '9:00 - 18:00',
          precio: 'Gratis',
          rating: 4.0,
          imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        };
        
        this.todosLosLugares.unshift(nuevoLugar);
        this.lugaresPopulares = this.todosLosLugares.slice(0, 2);
        resolve(true);
      }, 1000);
    });
  }

  // UPDATE - Editar lugar
  async editarLugar(lugar: Lugar) {
    const alert = await this.alertController.create({
      header: 'Editar Lugar',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: lugar.nombre,
          placeholder: 'Nombre'
        },
        {
          name: 'descripcion',
          type: 'textarea',
          value: lugar.descripcion,
          placeholder: 'Descripción'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: async (data) => {
            await this.actualizarLugarEnBD(lugar, data);
          }
        }
      ]
    });

    await alert.present();
  }

  private async actualizarLugarEnBD(lugar: Lugar, updates: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando...',
    });
    await loading.present();

    try {
      // SIMULAMOS actualizar en Supabase - luego reemplazarás con servicio real
      await this.simularActualizarEnSupabase(lugar, updates);
      
      await loading.dismiss();
      this.mostrarToast('Lugar actualizado correctamente', 'success');
      await this.cargarLugares();
    } catch (error) {
      await loading.dismiss();
      this.mostrarToast('Error al actualizar lugar', 'danger');
    }
  }

  // Simulación de actualización - REEMPLAZAR con servicio real
  private async simularActualizarEnSupabase(lugar: Lugar, updates: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.todosLosLugares.findIndex(l => l.id_lugares === lugar.id_lugares);
        if (index !== -1) {
          this.todosLosLugares[index] = {
            ...this.todosLosLugares[index],
            nombre: updates.nombre,
            descripcion: updates.descripcion
          };
        }
        resolve(true);
      }, 1000);
    });
  }

  // DELETE - Eliminar lugar
  async eliminarLugar(lugar: Lugar) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar "${lugar.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.eliminarLugarDeBD(lugar);
          }
        }
      ]
    });

    await alert.present();
  }

  private async eliminarLugarDeBD(lugar: Lugar) {
    const loading = await this.loadingController.create({
      message: 'Eliminando...',
    });
    await loading.present();

    try {
      // SIMULAMOS eliminar de Supabase - luego reemplazarás con servicio real
      await this.simularEliminarDeSupabase(lugar);
      
      await loading.dismiss();
      this.mostrarToast('Lugar eliminado correctamente', 'success');
      await this.cargarLugares();
    } catch (error) {
      await loading.dismiss();
      this.mostrarToast('Error al eliminar lugar', 'danger');
    }
  }

  // Simulación de eliminación - REEMPLAZAR con servicio real
  private async simularEliminarDeSupabase(lugar: Lugar) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.todosLosLugares = this.todosLosLugares.filter(l => l.id_lugares !== lugar.id_lugares);
        this.lugaresPopulares = this.todosLosLugares.slice(0, 2);
        resolve(true);
      }, 1000);
    });
  }

  // MÉTODOS EXISTENTES (los mantienes igual)
  seleccionarLugar(nombreLugar: string): void {
    this.terminoBusqueda = nombreLugar;
    this.filtrarLugares();
    
    setTimeout(() => {
      const element = document.querySelector('.results-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  irAResenas(lugar: Lugar): void {
    console.log('Navegando a reseñas de:', lugar.nombre);
    this.navCtrl.navigateForward(`/tabs/health?lugar=${encodeURIComponent(lugar.nombre)}`, {
      state: { lugar }
    });
  }

  manejarErrorImagen(lugar: Lugar): void {
    console.log('Error cargando imagen para:', lugar.nombre);
    lugar.imagen = '';
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Lifecycle hooks
  async ionViewDidEnter() {
    console.log('Capture page cargada - Lugares:', this.todosLosLugares.length);
  }
}