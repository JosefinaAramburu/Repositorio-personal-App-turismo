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
  ToastController,
  NavController
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
  closeCircleOutline,
  chatbubbleOutline,
  star
} from 'ionicons/icons';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

// INTERFAZ MEJORADA CON DATOS DE RESEÑAS - CORREGIDA
export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  totalResenas: number;      // ← Cambiado de opcional a requerido
  promedioRating: number;    // ← Cambiado de opcional a requerido
}

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  
  async crearLugar(lugar: Lugar): Promise<any> {
    console.log('🔄 Creando lugar:', lugar);
    
    // Solo enviar los campos necesarios a Supabase
    const lugarParaInsertar = {
      id_destino: lugar.id_destino,
      nombre: lugar.nombre,
      categoria: lugar.categoria,
      descripcion: lugar.descripcion,
      horario: lugar.horario
    };
    
    const { data, error } = await supabase
      .from('Lugares')
      .insert([lugarParaInsertar])
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
    
    // Obtener estadísticas de reseñas para cada lugar
    const lugaresConResenas = await Promise.all(
      (data || []).map(async (lugar) => {
        const estadisticas = await this.obtenerEstadisticasResenas(lugar.id_lugares!);
        return {
          ...lugar,
          totalResenas: estadisticas.totalResenas || 0,        // ← Valor por defecto
          promedioRating: estadisticas.promedioRating || 0     // ← Valor por defecto
        };
      })
    );
    
    return lugaresConResenas;
  }

  async obtenerEstadisticasResenas(idLugar: number): Promise<{totalResenas: number, promedioRating: number}> {
    try {
      const { data, error } = await supabase
        .from('Lugares_resenas')
        .select('calificacion')
        .eq('id_lugares', idLugar);

      if (error) {
        console.error('Error obteniendo estadísticas:', error);
        return { totalResenas: 0, promedioRating: 0 };
      }

      const totalResenas = data?.length || 0;
      
      if (totalResenas === 0) {
        return { totalResenas: 0, promedioRating: 0 };
      }

      const sumaRatings = data?.reduce((sum, resena) => sum + (resena.calificacion || 0), 0) || 0;
      const promedioRating = sumaRatings / totalResenas;

      return { totalResenas, promedioRating };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      return { totalResenas: 0, promedioRating: 0 };
    }
  }

  async actualizarLugar(id: number, updates: Partial<Lugar>): Promise<any> {
    console.log('🔄 Actualizando lugar', id, updates);
    
    // Solo actualizar campos editables, no las estadísticas
    const { totalResenas, promedioRating, ...camposEditables } = updates;
    
    const { data, error } = await supabase
      .from('Lugares')
      .update(camposEditables)
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
    
    // Primero eliminar las reseñas asociadas
    const { error: errorResenas } = await supabase
      .from('Lugares_resenas')
      .delete()
      .eq('id_lugares', id);
    
    if (errorResenas) {
      console.error('❌ Error eliminando reseñas del lugar:', errorResenas);
    }
    
    // Luego eliminar el lugar
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
  private navCtrl = inject(NavController);

  lugares: Lugar[] = [];
  nuevoLugar: Lugar = {
    id_destino: 1,
    nombre: '',
    categoria: '',
    descripcion: '',
    horario: '',
    totalResenas: 0,      // ← Valor por defecto agregado
    promedioRating: 0     // ← Valor por defecto agregado
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
      closeCircleOutline,
      chatbubbleOutline,
      star
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

  // 🎯 NAVEGACIÓN A RESEÑAS
  verResenas(lugar: Lugar) {
    if (!lugar.id_lugares) {
      this.mostrarError('No se puede acceder a las reseñas de este lugar');
      return;
    }

    this.navCtrl.navigateForward('/tabs/health', {
      queryParams: {
        id: lugar.id_lugares,
        lugar: lugar.nombre,
        categoria: lugar.categoria
      }
    });
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
      message: 'Esta acción eliminará el lugar y todas sus reseñas. No se puede deshacer.',
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
      horario: '',
      totalResenas: 0,      // ← Valor por defecto agregado
      promedioRating: 0     // ← Valor por defecto agregado
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