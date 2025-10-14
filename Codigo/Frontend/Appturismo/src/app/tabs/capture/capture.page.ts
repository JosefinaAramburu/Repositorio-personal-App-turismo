import { Component, OnInit } from '@angular/core';
import { CaptureService, Lugar } from './capture.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton,
  IonList,
  IonTextarea,
  IonBadge
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonTextarea,
    IonBadge
  ]
})
export class CapturePage implements OnInit {
  lugares: Lugar[] = [];
  nuevoLugar: any = {
    id_destino: 1,
    nombre: '',
    categoria: '',
    descripcion: '',
    horario: '',
    precio: '',
    rating: 0,
    ciudad: '',
    pais: ''
  };
  lugarEditando: any = null;
  terminoBusqueda: string = '';

  constructor(
    private captureService: CaptureService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.cargarLugares();
  }

  async cargarLugares() {
    try {
      const loading = await this.loadingController.create({
        message: 'Cargando lugares...',
      });
      await loading.present();

      this.lugares = await this.captureService.obtenerLugares();
      await loading.dismiss();
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.mostrarError('Error al cargar lugares: ' + error.message);
    }
  }

  async crearLugar() {
    if (!this.nuevoLugar.nombre || !this.nuevoLugar.categoria) {
      this.mostrarError('Nombre y categoría son obligatorios');
      return;
    }

    try {
      const loading = await this.loadingController.create({
        message: 'Creando lugar...',
      });
      await loading.present();

      await this.captureService.crearLugar(this.nuevoLugar);
      
      this.nuevoLugar = {
        id_destino: 1,
        nombre: '',
        categoria: '',
        descripcion: '',
        horario: '',
        precio: '',
        rating: 0,
        ciudad: '',
        pais: ''
      };

      await this.cargarLugares();
      await loading.dismiss();
      this.mostrarExito('Lugar creado exitosamente');
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  editarLugar(lugar: Lugar) {
    this.lugarEditando = { ...lugar };
  }

  async guardarEdicion() {
    if (!this.lugarEditando) return;

    try {
      const loading = await this.loadingController.create({
        message: 'Actualizando lugar...',
      });
      await loading.present();

      await this.captureService.actualizarLugar(this.lugarEditando.id_lugares, this.lugarEditando);
      
      this.lugarEditando = null;
      await this.cargarLugares();
      await loading.dismiss();
      this.mostrarExito('Lugar actualizado exitosamente');
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.mostrarError('Error al actualizar lugar: ' + error.message);
    }
  }

  cancelarEdicion() {
    this.lugarEditando = null;
  }

  async eliminarLugar(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar este lugar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.captureService.eliminarLugar(id);
              this.mostrarExito('Lugar eliminado exitosamente');
              await this.cargarLugares();
            } catch (error: any) {
              this.mostrarError('Error al eliminar lugar: ' + error.message);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async buscarLugares() {
    if (!this.terminoBusqueda.trim()) {
      this.cargarLugares();
      return;
    }

    try {
      this.lugares = await this.captureService.buscarLugares(this.terminoBusqueda);
    } catch (error: any) {
      this.mostrarError('Error al buscar lugares: ' + error.message);
    }
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}