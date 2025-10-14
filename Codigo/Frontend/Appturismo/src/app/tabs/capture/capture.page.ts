import { Component, OnInit } from '@angular/core';
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
  IonTextarea
} from '@ionic/angular/standalone';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  imagen?: string;
  rating?: number;
  precio?: string;
  ciudad?: string;
  pais?: string;
}

@Injectable({
  providedIn: 'root'
})
class CaptureService {
  // CREATE - Crear nuevo lugar
  async crearLugar(lugar: Omit<Lugar, 'id_lugares'>): Promise<any> {
    const { data, error } = await supabase
      .from('Lugares')
      .insert([lugar])
      .select();
    
    if (error) {
      console.error('Error creando lugar:', error);
      throw error;
    }
    return data;
  }

  // READ - Obtener todos los lugares
  async obtenerLugares(): Promise<Lugar[]> {
    const { data, error } = await supabase
      .from('Lugares')
      .select('*')
      .order('id_lugares', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo lugares:', error);
      throw error;
    }
    return data || [];
  }

  // UPDATE - Actualizar lugar
  async actualizarLugar(id: number, updates: Partial<Lugar>): Promise<any> {
    const { data, error } = await supabase
      .from('Lugares')
      .update(updates)
      .eq('id_lugares', id)
      .select();
    
    if (error) {
      console.error('Error actualizando lugar:', error);
      throw error;
    }
    return data;
  }

  // DELETE - Eliminar lugar
  async eliminarLugar(id: number): Promise<any> {
    const { error } = await supabase
      .from('Lugares')
      .delete()
      .eq('id_lugares', id);
    
    if (error) {
      console.error('Error eliminando lugar:', error);
      throw error;
    }
    return { success: true };
  }
}

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
    IonTextarea
  ],
  providers: [CaptureService]
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