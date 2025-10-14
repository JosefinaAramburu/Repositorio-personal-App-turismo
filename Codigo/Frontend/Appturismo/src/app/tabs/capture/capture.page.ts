import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle,
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonList,
  IonTextarea,
  IonIcon,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonLoading,
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
  refreshOutline,
  addOutline,
  closeCircleOutline
} from 'ionicons/icons';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

// INTERFAZ
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
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonTextarea,
    IonIcon,
    IonBadge,
    IonFab,
    IonFabButton,
    IonSelect,
    IonSelectOption,
    IonLoading
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
  mostrarFormulario = false;
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
      refreshOutline,
      addOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {
    this.cargarLugares();
  }

  // 🎯 FUNCIONES DE NAVEGACIÓN
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.lugarEditando = null;
    this.limpiarFormulario();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.lugarEditando = null;
    this.limpiarFormulario();
  }

  // 🎯 FUNCIONES PRINCIPALES
  async cargarLugares() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      this.lugares = await this.captureService.obtenerLugares();
      this.isLoading = false;
      
    } catch (error: any) {
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
      this.mostrarFormulario = false;
      
      await loading.dismiss();
      this.mostrarExito('¡Lugar creado exitosamente!');
      
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  editarLugar(lugar: Lugar) {
    this.lugarEditando = { ...lugar };
    this.mostrarFormulario = true;
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
      this.mostrarFormulario = false;
      await this.cargarLugares();
      
      await loading.dismiss();
      this.mostrarExito('¡Lugar actualizado exitosamente!');
      
    } catch (error: any) {
      await this.loadingController.dismiss();
      this.mostrarError('Error al actualizar lugar: ' + error.message);
    }
  }

  cancelarEdicion() {
    this.lugarEditando = null;
    this.mostrarFormulario = false;
    this.limpiarFormulario();
  }

  async eliminarLugar(id: number) {
    const alert = await this.alertController.create({
      header: '¿Eliminar lugar?',
      message: 'Esta acción no se puede deshacer. El lugar será eliminado permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'danger-button',
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
              this.mostrarExito('¡Lugar eliminado exitosamente!');
              
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

  // 🎯 FUNCIONES DE DISEÑO Y UTILIDAD
  getCategoriaIcon(categoria: string): string {
    const iconMap: { [key: string]: string } = {
      'Monumento': 'business-outline',
      'Museo': 'library-outline',
      'Parque': 'leaf-outline',
      'Playa': 'water-outline',
      'Restaurante': 'restaurant-outline',
      'Cafetería': 'cafe-outline',
      'Mirador': 'eye-outline',
      'Histórico': 'time-outline',
      'Shopping': 'cart-outline',
      'Otro': 'location-outline'
    };
    return iconMap[categoria] || 'location-outline';
  }

  getCategoriaClass(categoria: string): string {
    const classMap: { [key: string]: string } = {
      'Monumento': 'monumento',
      'Museo': 'museo',
      'Parque': 'parque',
      'Playa': 'playa',
      'Restaurante': 'restaurante',
      'Cafetería': 'cafeteria',
      'Mirador': 'mirador',
      'Histórico': 'historico',
      'Shopping': 'shopping',
      'Otro': 'otro'
    };
    return classMap[categoria] || 'otro';
  }

  getCategoriaColor(categoria: string): string {
    const colorMap: { [key: string]: string } = {
      'Monumento': 'warning',
      'Museo': 'tertiary',
      'Parque': 'success',
      'Playa': 'info',
      'Restaurante': 'danger',
      'Cafetería': 'orange',
      'Mirador': 'primary',
      'Histórico': 'medium',
      'Shopping': 'pink',
      'Otro': 'dark'
    };
    return colorMap[categoria] || 'medium';
  }

  // 🎯 FUNCIONES PRIVADAS
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
      position: 'top',
      buttons: [
        {
          icon: 'close-circle-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  trackByLugar(index: number, lugar: Lugar): number {
    return lugar.id_lugares!;
  }
}