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
    console.log('🔄 Service: Creando lugar en Supabase...', lugar);
    
    const { data, error } = await supabase
      .from('Lugares')
      .insert([lugar])
      .select();
    
    if (error) {
      console.error('❌ Service: Error creando lugar:', error);
      throw error;
    }
    
    console.log('✅ Service: Lugar creado exitosamente:', data);
    return data;
  }

  // READ - Obtener todos los lugares
  async obtenerLugares(): Promise<Lugar[]> {
    console.log('🔄 Service: Obteniendo lugares de Supabase...');
    
    const { data, error } = await supabase
      .from('Lugares')
      .select('*')
      .order('id_lugares', { ascending: true });
    
    if (error) {
      console.error('❌ Service: Error obteniendo lugares:', error);
      throw error;
    }
    
    console.log('✅ Service: Lugares obtenidos:', data);
    return data || [];
  }

  // UPDATE - Actualizar lugar
  async actualizarLugar(id: number, updates: Partial<Lugar>): Promise<any> {
    console.log('🔄 Service: Actualizando lugar', id, updates);
    
    const { data, error } = await supabase
      .from('Lugares')
      .update(updates)
      .eq('id_lugares', id)
      .select();
    
    if (error) {
      console.error('❌ Service: Error actualizando lugar:', error);
      throw error;
    }
    
    console.log('✅ Service: Lugar actualizado:', data);
    return data;
  }

  // DELETE - Eliminar lugar
  async eliminarLugar(id: number): Promise<any> {
    console.log('🔄 Service: Eliminando lugar', id);
    
    const { error } = await supabase
      .from('Lugares')
      .delete()
      .eq('id_lugares', id);
    
    if (error) {
      console.error('❌ Service: Error eliminando lugar:', error);
      throw error;
    }
    
    console.log('✅ Service: Lugar eliminado exitosamente');
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
    precio: ''
  };
  lugarEditando: any = null;

  constructor(
    private captureService: CaptureService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    console.log('🎯 CapturePage iniciado');
    this.cargarLugares();
  }

  async cargarLugares() {
    try {
      console.log('🔄 Cargando lugares...');
      
      const loading = await this.loadingController.create({
        message: 'Cargando lugares...',
      });
      await loading.present();

      const datos = await this.captureService.obtenerLugares();
      console.log('📊 Datos recibidos:', datos);
      
      this.lugares = datos;
      console.log('✅ Lugares asignados a la vista:', this.lugares);
      
      await loading.dismiss();
      console.log('🎉 Carga completada');
      
    } catch (error: any) {
      console.error('💥 Error cargando lugares:', error);
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
      console.log('➕ Creando nuevo lugar:', this.nuevoLugar);
      
      const loading = await this.loadingController.create({
        message: 'Creando lugar...',
      });
      await loading.present();

      await this.captureService.crearLugar(this.nuevoLugar);
      console.log('💾 Lugar creado en Supabase');
      
      // Limpiar formulario
      this.nuevoLugar = {
        id_destino: 1,
        nombre: '',
        categoria: '',
        descripcion: '',
        horario: '',
        precio: ''
      };

      console.log('🔄 Recargando lista...');
      await this.cargarLugares();
      
      await loading.dismiss();
      this.mostrarExito('Lugar creado exitosamente');
      
    } catch (error: any) {
      console.error('💥 Error creando lugar:', error);
      await this.loadingController.dismiss();
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  editarLugar(lugar: Lugar) {
    console.log('✏️ Editando lugar:', lugar);
    this.lugarEditando = { ...lugar };
  }

  async guardarEdicion() {
    if (!this.lugarEditando) return;

    try {
      console.log('💾 Guardando edición:', this.lugarEditando);
      
      const loading = await this.loadingController.create({
        message: 'Actualizando lugar...',
      });
      await loading.present();

      await this.captureService.actualizarLugar(this.lugarEditando.id_lugares, this.lugarEditando);
      console.log('✅ Edición guardada');
      
      this.lugarEditando = null;
      await this.cargarLugares();
      await loading.dismiss();
      this.mostrarExito('Lugar actualizado exitosamente');
      
    } catch (error: any) {
      console.error('💥 Error guardando edición:', error);
      await this.loadingController.dismiss();
      this.mostrarError('Error al actualizar lugar: ' + error.message);
    }
  }

  cancelarEdicion() {
    console.log('❌ Cancelando edición');
    this.lugarEditando = null;
  }

  async eliminarLugar(id: number) {
    console.log('🗑️ Solicitando eliminar lugar:', id);
    
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar este lugar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('❌ Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              console.log('✅ Confirmada eliminación de lugar:', id);
              await this.captureService.eliminarLugar(id);
              this.mostrarExito('Lugar eliminado exitosamente');
              await this.cargarLugares();
            } catch (error: any) {
              console.error('💥 Error eliminando lugar:', error);
              this.mostrarError('Error al eliminar lugar: ' + error.message);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarError(mensaje: string) {
    console.error('🚨 Mostrando error:', mensaje);
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarExito(mensaje: string) {
    console.log('🎉 Mostrando éxito:', mensaje);
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}