import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonIcon,
  IonBadge,
  AlertController, 
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  addCircleOutline, 
  createOutline, 
  locationOutline, 
  mapOutline,
  saveOutline,
  checkmarkOutline,
  closeOutline,
  timeOutline,
  trashOutline,
  refreshOutline
} from 'ionicons/icons';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

// INTERFAZ EXACTA - solo campos que existen en tu BD
export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  
  async crearLugar(lugar: Lugar): Promise<any> {
    console.log('🔄 Creando lugar:', lugar);
    
    const { data, error } = await supabase
      .from('Lugares')
      .insert([lugar])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando lugar:', error);
      throw new Error(`Error al crear lugar: ${error.message}`);
    }
    
    console.log('✅ Lugar creado:', data);
    return data;
  }

  async obtenerLugares(): Promise<Lugar[]> {
    console.log('🔄 Obteniendo lugares...');
    
    const { data, error } = await supabase
      .from('Lugares')
      .select('*')
      .order('id_lugares', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo lugares:', error);
      throw new Error(`Error al obtener lugares: ${error.message}`);
    }
    
    return data || [];
  }

  async actualizarLugar(id: number, updates: Partial<Lugar>): Promise<any> {
    console.log('🔄 Actualizando lugar', id, updates);
    
    const { data, error } = await supabase
      .from('Lugares')
      .update(updates)
      .eq('id_lugares', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error actualizando lugar:', error);
      throw new Error(`Error al actualizar lugar: ${error.message}`);
    }
    
    return data;
  }

  async eliminarLugar(id: number): Promise<void> {
    console.log('🔄 Eliminando lugar', id);
    
    const { error } = await supabase
      .from('Lugares')
      .delete()
      .eq('id_lugares', id);
    
    if (error) {
      console.error('❌ Error eliminando lugar:', error);
      throw new Error(`Error al eliminar lugar: ${error.message}`);
    }
  }
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonIcon,
    IonBadge
  ],
  providers: [CaptureService]
})
export class CapturePage implements OnInit {
  private captureService = inject(CaptureService);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  lugares: Lugar[] = [];
  nuevoLugar: Lugar = {
    id_destino: 1,
    nombre: '',
    categoria: '',
    descripcion: '',
    horario: ''
  };
  lugarEditando: Lugar | null = null;
  isLoading = false;

  constructor() {
    addIcons({
      addCircleOutline, 
      createOutline, 
      locationOutline, 
      mapOutline,
      saveOutline,
      checkmarkOutline,
      closeOutline,
      timeOutline,
      trashOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    this.cargarLugares();
  }

  async cargarLugares() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const loading = await this.loadingController.create({
        message: 'Cargando lugares...',
        spinner: 'crescent'
      });
      await loading.present();

      this.lugares = await this.captureService.obtenerLugares();
      
      await loading.dismiss();
      this.isLoading = false;
      
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.isLoading = false;
      this.mostrarError('Error al cargar lugares: ' + error.message);
    }
  }

  async crearLugar() {
    if (!this.validarFormulario()) return;

    try {
      const loading = await this.loadingController.create({
        message: 'Creando lugar...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.captureService.crearLugar(this.nuevoLugar);
      
      this.limpiarFormulario();
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
    const content = document.querySelector('ion-content');
    content?.scrollToTop(500);
  }

  async guardarEdicion() {
    if (!this.lugarEditando || !this.validarFormularioEdicion()) return;

    try {
      const loading = await this.loadingController.create({
        message: 'Actualizando lugar...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.captureService.actualizarLugar(this.lugarEditando.id_lugares!, this.lugarEditando);
      
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
    this.limpiarFormulario();
  }

  async eliminarLugar(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este lugar? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              const loading = await this.loadingController.create({
                message: 'Eliminando lugar...',
                spinner: 'crescent'
              });
              await loading.present();

              await this.captureService.eliminarLugar(id);
              await this.cargarLugares();
              
              await loading.dismiss();
              this.mostrarExito('Lugar eliminado exitosamente');
              
            } catch (error: any) {
              await this.loadingController.dismiss();
              this.mostrarError('Error al eliminar lugar: ' + error.message);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private validarFormulario(): boolean {
    if (!this.nuevoLugar.nombre?.trim()) {
      this.mostrarError('El nombre del lugar es obligatorio');
      return false;
    }
    
    if (!this.nuevoLugar.categoria?.trim()) {
      this.mostrarError('La categoría del lugar es obligatoria');
      return false;
    }
    
    return true;
  }

  private validarFormularioEdicion(): boolean {
    if (!this.lugarEditando?.nombre?.trim()) {
      this.mostrarError('El nombre del lugar es obligatorio');
      return false;
    }
    
    if (!this.lugarEditando?.categoria?.trim()) {
      this.mostrarError('La categoría del lugar es obligatoria');
      return false;
    }
    
    return true;
  }

  private limpiarFormulario() {
    this.nuevoLugar = {
      id_destino: 1,
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: ''
    };
  }

  private async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  trackByLugar(index: number, lugar: Lugar): number {
    return lugar.id_lugares!;
  }
}