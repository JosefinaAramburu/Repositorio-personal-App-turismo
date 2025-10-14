import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonTextarea,
  IonAvatar, IonBackButton, IonButtons, ToastController, NavController,
  LoadingController, IonBadge, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { supabase } from '../../supabase';

import { addIcons } from 'ionicons';
import { refreshOutline, createOutline, star } from 'ionicons/icons';

interface Resena {
  id_resenas: number;
  id_usuario: number;
  texto: string;
  puntuacion: number;
  fecha: string;
  usuario: string;
  avatar?: string;
  rating: number;
  comentario?: string;
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
  private route = inject(ActivatedRoute);

  lugarSeleccionado: string = 'Lugar no especificado';
  idLugarSeleccionado: number = 0;
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
      
      console.log('🔄 Cargando reseñas para lugar:', {
        nombre: this.lugarSeleccionado,
        id: this.idLugarSeleccionado
      });
      
      await this.cargarResenas();
    });
  }

  async cargarResenas() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando reseñas...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('🔄 Cargando reseñas para lugar ID:', this.idLugarSeleccionado);

      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('Lugares_Resenas')
        .select('id_resenas')
        .eq('id_lugares', this.idLugarSeleccionado);

      if (errorRelaciones) {
        console.error('❌ Error cargando relaciones:', errorRelaciones);
        throw errorRelaciones;
      }

      console.log('📋 IDs de reseñas encontradas:', relaciones);

      if (!relaciones || relaciones.length === 0) {
        this.resenas = [];
        console.log('ℹ️ No hay reseñas para este lugar');
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      const idsResenas = relaciones.map(rel => rel.id_resenas);
      
      const { data: reseñasData, error: errorResenas } = await supabase
        .from('Resenas')
        .select('*')
        .in('id_resenas', idsResenas)
        .order('fecha', { ascending: false });

      if (errorResenas) {
        console.error('❌ Error cargando reseñas:', errorResenas);
        throw errorResenas;
      }

      console.log('📊 Reseñas obtenidas:', reseñasData);

      this.resenas = (reseñasData || []).map(resena => ({
        id_resenas: resena.id_resenas,
        id_usuario: resena.id_usuario,
        texto: resena.texto || '',
        puntuacion: resena.puntuacion || 0,
        fecha: this.formatearFecha(resena.fecha),
        usuario: this.getNombreUsuario(resena.id_usuario),
        avatar: this.getRandomAvatar(resena.id_usuario),
        rating: resena.puntuacion || 0,
        comentario: resena.texto || ''
      }));

      console.log(`✅ ${this.resenas.length} reseñas cargadas correctamente`);
      
    } catch (error: any) {
      console.error('❌ Error cargando reseñas:', error);
      await this.mostrarToast('Error al cargar reseñas: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  async agregarResena() {
    if (!this.nuevaResenaTexto.trim()) {
      await this.mostrarToast('Por favor, escribí tu reseña antes de publicar', 'warning');
      return;
    }

    if (this.nuevaResenaRating === 0) {
      await this.mostrarToast('Por favor, seleccioná una calificación', 'warning');
      return;
    }

    if (!this.idLugarSeleccionado) {
      await this.mostrarToast('Error: No se identificó el lugar', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Publicando reseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('🔄 Creando nueva reseña...');

      const resenaData = {
        id_usuario: 1,
        texto: this.nuevaResenaTexto.trim(),
        puntuacion: this.nuevaResenaRating,
        fecha: new Date().toISOString().split('T')[0]
      };

      const { data: nuevaResena, error: errorResena } = await supabase
        .from('Resenas')
        .insert([resenaData])
        .select()
        .single();

      if (errorResena) {
        console.error('❌ Error creando reseña:', errorResena);
        throw errorResena;
      }

      console.log('✅ Reseña creada:', nuevaResena);

      const relacionData = {
        id_lugares: this.idLugarSeleccionado,
        id_resenas: nuevaResena.id_resenas
      };

      const { error: errorRelacion } = await supabase
        .from('Lugares_Resenas')
        .insert([relacionData]);

      if (errorRelacion) {
        console.error('❌ Error creando relación:', errorRelacion);
        throw errorRelacion;
      }

      console.log('✅ Relación creada correctamente');

      const resenaParaLista: Resena = {
        id_resenas: nuevaResena.id_resenas,
        id_usuario: nuevaResena.id_usuario,
        texto: nuevaResena.texto,
        puntuacion: nuevaResena.puntuacion,
        fecha: this.formatearFecha(nuevaResena.fecha),
        usuario: 'Tú',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        rating: nuevaResena.puntuacion,
        comentario: nuevaResena.texto
      };

      this.resenas.unshift(resenaParaLista);

      this.nuevaResenaTexto = '';
      this.nuevaResenaRating = 0;

      await this.mostrarToast('¡Reseña publicada con éxito!', 'success');

      setTimeout(() => {
        const content = document.querySelector('ion-content');
        content?.scrollToTop(500);
      }, 300);

    } catch (error: any) {
      console.error('❌ Error publicando reseña:', error);
      await this.mostrarToast('Error al publicar reseña: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  seleccionarRating(rating: number) {
    this.nuevaResenaRating = rating;
    console.log('⭐ Rating seleccionado:', rating);
  }

  obtenerPromedioRating(): string {
    if (this.resenas.length === 0) return '0.0';
    const total = this.resenas.reduce((sum, resena) => sum + resena.puntuacion, 0);
    return (total / this.resenas.length).toFixed(1);
  }

  calcularPorcentajeRating(rating: number): number {
    const count = this.resenas.filter(r => r.puntuacion === rating).length;
    return this.resenas.length > 0 ? Math.round((count / this.resenas.length) * 100) : 0;
  }

  private formatearFecha(fechaString: string): string {
    try {
      const fecha = new Date(fechaString + 'T00:00:00');
      return fecha.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

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

  private async mostrarToast(mensaje: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async recargarResenas() {
    console.log('🔄 Recargando reseñas...');
    await this.cargarResenas();
  }
}