import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle,
  IonButton,
  IonTextarea,
  IonAvatar,
  IonBackButton,
  IonButtons,
  ToastController,
  NavController,
  LoadingController,
  IonBadge,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { supabase } from '../../supabase';

// Agregar estos iconos
import { addIcons } from 'ionicons';
import { refreshOutline, createOutline, star } from 'ionicons/icons';

interface Resena {
  id_resenas?: number;
  id_usuario: number;
  id_lugar: number;
  texto: string;
  fecha: string;
  usuario: string;
  avatar?: string;
  rating: number;
}

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonTextarea,
    IonAvatar,
    IonBackButton,
    IonButtons,
    IonBadge,
    IonIcon,
    IonSpinner
  ],
})
export class HealthPage implements OnInit {
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);

  lugarSeleccionado: string = 'Lugar no especificado';
  idLugarSeleccionado: number = 0;
  categoriaLugar: string = '';
  nuevaResenaTexto: string = '';
  nuevaResenaRating: number = 0;
  isLoading: boolean = false;
  
  resenas: Resena[] = [];

  constructor() {
    addIcons({
      refreshOutline,
      createOutline,
      star
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.lugarSeleccionado = params['lugar'] || 'Lugar no especificado';
      this.idLugarSeleccionado = params['id'] ? parseInt(params['id']) : 0;
      this.categoriaLugar = params['categoria'] || '';
      
      console.log('Lugar seleccionado:', this.lugarSeleccionado, 
                  'ID:', this.idLugarSeleccionado, 
                  'Categoría:', this.categoriaLugar);
      
      await this.cargarResenas();
    });
  }

  /**
   * Cargar reseñas desde Supabase
   */
  async cargarResenas() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando reseñas...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // USAR EL NOMBRE EXACTO DE TU TABLA
      const { data, error } = await supabase
        .from('Lugares_resenas')  // ← Cambiar por el nombre exacto de tu tabla
        .select('*')
        .eq('id_lugares', this.idLugarSeleccionado)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error cargando reseñas:', error);
        throw error;
      }

      console.log('Datos crudos de Supabase:', data);

      // Transformar datos de Supabase a nuestro formato
      this.resenas = (data || []).map(resena => ({
        id_resenas: resena.id_resenas,  
        id_usuario: resena.id_usuario,
        id_lugar: resena.id_lugares,
        texto: resena.comentario,
        fecha: this.formatearFecha(resena.fecha_creacion),
        usuario: this.getNombreUsuario(resena.id_usuario),
        avatar: this.getRandomAvatar(resena.id_usuario),
        rating: resena.calificacion
      }));

      console.log('Reseñas transformadas:', this.resenas);
      
    } catch (error: any) {
      console.error('Error:', error);
      await this.mostrarToast('Error al cargar reseñas: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  /**
   * Agregar una nueva reseña a la base de datos
   */
  async agregarResena() {
    if (!this.nuevaResenaTexto.trim()) {
      await this.mostrarToast('Por favor, escribí tu reseña antes de publicar', 'warning');
      return;
    }

    if (this.nuevaResenaRating === 0) {
      await this.mostrarToast('Por favor, seleccioná una calificación', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Publicando reseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Insertar en Supabase
      const { data, error } = await supabase
        .from('Lugares_resenas')
        .insert([
          {
            id_usuario: 1, // Por ahora usuario fijo
            id_lugares: this.idLugarSeleccionado,
            comentario: this.nuevaResenaTexto.trim(),
            calificacion: this.nuevaResenaRating,
            fecha_creacion: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creando reseña:', error);
        throw error;
      }

      console.log('Reseña creada en Supabase:', data);

      // Agregar la nueva reseña localmente
      const nuevaResena: Resena = {
        id_resenas: data.id_resenas,
        id_usuario: data.id_usuario,
        id_lugar: data.id_lugares,
        texto: data.comentario,
        fecha: this.formatearFecha(data.fecha_creacion),
        usuario: 'Tú',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        rating: data.calificacion
      };

      this.resenas.unshift(nuevaResena);

      // Limpiar formulario
      this.nuevaResenaTexto = '';
      this.nuevaResenaRating = 0;

      await this.mostrarToast('¡Reseña publicada con éxito!', 'success');

      // Scroll to top para ver la nueva reseña
      setTimeout(() => {
        const content = document.querySelector('ion-content');
        if (content) {
          content.scrollToTop(500);
        }
      }, 300);

    } catch (error: any) {
      console.error('Error:', error);
      await this.mostrarToast('Error al publicar reseña: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Formatear fecha de manera más robusta
   */
  private formatearFecha(fechaString: string): string {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  /**
   * Seleccionar rating para nueva reseña
   */
  seleccionarRating(rating: number) {
    this.nuevaResenaRating = rating;
  }

  /**
   * Calcular promedio de ratings
   */
  obtenerPromedioRating(): string {
    if (this.resenas.length === 0) return '0.0';
    
    const total = this.resenas.reduce((sum, resena) => sum + resena.rating, 0);
    const promedio = total / this.resenas.length;
    return promedio.toFixed(1);
  }

  /**
   * Calcular porcentaje de cada rating
   */
  calcularPorcentajeRating(rating: number): number {
    const count = this.resenas.filter(r => r.rating === rating).length;
    const total = this.resenas.length;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  /**
   * Obtener nombre de usuario (por ahora simulado)
   */
  private getNombreUsuario(idUsuario: number): string {
    const usuarios: { [key: number]: string } = {
      1: 'María González',
      2: 'Carlos Rodríguez', 
      3: 'Ana Martínez',
      4: 'Javier López',
      5: 'Tú'
    };
    return usuarios[idUsuario] || `Usuario ${idUsuario}`;
  }

  /**
   * Generar avatar aleatorio consistente por usuario
   */
  private getRandomAvatar(idUsuario: number): string {
    const avatars: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      4: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      5: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    return avatars[idUsuario] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  }

  /**
   * Mostrar toast de notificación
   */
  private async mostrarToast(mensaje: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Recargar reseñas
   */
  async recargarResenas() {
    await this.cargarResenas();
  }

  /**
   * Lifecycle hook - cuando la página entra
   */
  ionViewDidEnter() {
    console.log('Página de reseñas cargada para:', this.lugarSeleccionado);
  }
}