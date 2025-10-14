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
  cashOutline,
  trashOutline,
  refreshOutline
} from 'ionicons/icons';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

// Interfaz para la base de datos - solo campos que existen
export interface LugarBD {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
}

// Interfaz para el formulario - incluye todos los campos del HTML
export interface LugarFormulario {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  precio?: string; // Campo adicional para el formulario
}

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  
  // CREATE - Crear nuevo lugar
  async crearLugar(lugar: LugarBD): Promise<any> {
    console.log('🔄 Service: Creando lugar en Supabase...', lugar);
    
    const { data, error } = await supabase
      .from('Lugares')
      .insert([lugar])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Service: Error creando lugar:', error);
      throw new Error(`Error al crear lugar: ${error.message}`);
    }
    
    console.log('✅ Service: Lugar creado exitosamente:', data);
    return data;
  }

  // READ - Obtener todos los lugares
  async obtenerLugares(): Promise<LugarBD[]> {
    console.log('🔄 Service: Obteniendo lugares de Supabase...');
    
    const { data, error } = await supabase
      .from('Lugares')
      .select('*')
      .order('id_lugares', { ascending: false });
    
    if (error) {
      console.error('❌ Service: Error obteniendo lugares:', error);
      throw new Error(`Error al obtener lugares: ${error.message}`);
    }
    
    console.log('✅ Service: Lugares obtenidos:', data?.length || 0);
    return data || [];
  }

  // UPDATE - Actualizar lugar
  async actualizarLugar(id: number, updates: Partial<LugarBD>): Promise<any> {
    console.log('🔄 Service: Actualizando lugar', id, updates);
    
    const { data, error } = await supabase
      .from('Lugares')
      .update(updates)
      .eq('id_lugares', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Service: Error actualizando lugar:', error);
      throw new Error(`Error al actualizar lugar: ${error.message}`);
    }
    
    console.log('✅ Service: Lugar actualizado:', data);
    return data;
  }

  // DELETE - Eliminar lugar
  async eliminarLugar(id: number): Promise<void> {
    console.log('🔄 Service: Eliminando lugar', id);
    
    const { error } = await supabase
      .from('Lugares')
      .delete()
      .eq('id_lugares', id);
    
    if (error) {
      console.error('❌ Service: Error eliminando lugar:', error);
      throw new Error(`Error al eliminar lugar: ${error.message}`);
    }
    
    console.log('✅ Service: Lugar eliminado exitosamente');
  }
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- IMPORTANTE: FormsModule para ngModel
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

  lugares: LugarBD[] = [];
  
  // Formulario con binding bidireccional - incluye todos los campos
  nuevoLugar: LugarFormulario = {
    id_destino: 1,
    nombre: '',
    categoria: '',
    descripcion: '',
    horario: '',
    precio: ''
  };
  
  lugarEditando: LugarFormulario | null = null;
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
      cashOutline,
      trashOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    console.log('🎯 CapturePage iniciado');
    this.cargarLugares();
  }

  async cargarLugares() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      console.log('🔄 Cargando lugares...');
      
      const loading = await this.loadingController.create({
        message: 'Cargando lugares...',
        spinner: 'crescent'
      });
      await loading.present();

      this.lugares = await this.captureService.obtenerLugares();
      console.log('✅ Lugares cargados:', this.lugares.length);
      
      await loading.dismiss();
      this.isLoading = false;
      
    } catch (error: any) {
      console.error('💥 Error cargando lugares:', error);
      await this.loadingController.dismiss();
      this.isLoading = false;
      this.mostrarError('Error al cargar lugares: ' + error.message);
    }
  }

  async crearLugar() {
    if (!this.validarFormulario()) return;

    try {
      console.log('➕ Creando nuevo lugar:', this.nuevoLugar);
      
      const loading = await this.loadingController.create({
        message: 'Creando lugar...',
        spinner: 'crescent'
      });
      await loading.present();

      // Convertimos a LugarBD (solo campos que existen en BD)
      const lugarParaBD: LugarBD = {
        id_destino: this.nuevoLugar.id_destino,
        nombre: this.nuevoLugar.nombre,
        categoria: this.nuevoLugar.categoria,
        descripcion: this.nuevoLugar.descripcion,
        horario: this.nuevoLugar.horario
        // precio no se incluye porque no existe en BD
      };

      await this.captureService.crearLugar(lugarParaBD);
      
      // Limpiar formulario
      this.limpiarFormulario();

      // Recargar lista
      await this.cargarLugares();
      
      await loading.dismiss();
      this.mostrarExito('Lugar creado exitosamente');
      
    } catch (error: any) {
      console.error('💥 Error creando lugar:', error);
      await this.loadingController.dismiss();
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  editarLugar(lugar: LugarBD) {
    console.log('✏️ Editando lugar:', lugar);
    // Convertimos de LugarBD a LugarFormulario
    this.lugarEditando = { 
      ...lugar,
      precio: '' // Inicializamos precio vacío
    };
    // Scroll to top para ver el formulario de edición
    const content = document.querySelector('ion-content');
    content?.scrollToTop(500);
  }

  async guardarEdicion() {
    if (!this.lugarEditando || !this.validarFormularioEdicion()) return;

    try {
      console.log('💾 Guardando edición:', this.lugarEditando);
      
      const loading = await this.loadingController.create({
        message: 'Actualizando lugar...',
        spinner: 'crescent'
      });
      await loading.present();

      // Convertimos a LugarBD (excluimos precio)
      const { id_lugares, precio, ...updates } = this.lugarEditando;
      await this.captureService.actualizarLugar(id_lugares!, updates);
      
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
    this.limpiarFormulario();
  }

  async eliminarLugar(id: number) {
    console.log('🗑️ Solicitando eliminar lugar:', id);
    
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este lugar? Esta acción no se puede deshacer.',
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
          role: 'destructive',
          handler: async () => {
            try {
              console.log('✅ Confirmada eliminación de lugar:', id);
              
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
              console.error('💥 Error eliminando lugar:', error);
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
      horario: '',
      precio: ''
    };
  }

  private async mostrarError(mensaje: string) {
    console.error('🚨 Mostrando error:', mensaje);
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'top',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async mostrarExito(mensaje: string) {
    console.log('🎉 Mostrando éxito:', mensaje);
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  // Helper para trackBy en ngFor
  trackByLugar(index: number, lugar: LugarBD): number {
    return lugar.id_lugares!;
  }
}