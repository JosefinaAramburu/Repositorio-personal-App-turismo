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
      
      console.log('📍 Lugar seleccionado:', this.lugarSeleccionado, 'ID:', this.idLugarSeleccionado);
      
      await this.diagnosticarTablas();
      await this.cargarResenas();
    });
  }

  /**
   * DIAGNÓSTICO DE TABLAS
   */
  async diagnosticarTablas() {
    try {
      console.log('🔍 INICIANDO DIAGNÓSTICO...');
      
      // 1. Verificar que el lugar existe
      const { data: lugar, error: errorLugar } = await supabase
        .from('Lugares')
        .select('*')
        .eq('id_lugares', this.idLugarSeleccionado)
        .single();
      
      console.log('📍 Lugar encontrado:', lugar);
      if (errorLugar) console.error('❌ Error buscando lugar:', errorLugar);
      
      // 2. Verificar relaciones existentes para este lugar
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('Lugares_Resenas')
        .select('*')
        .eq('id_lugares', this.idLugarSeleccionado);
      
      console.log('🔗 Relaciones encontradas:', relaciones);
      if (errorRelaciones) console.error('❌ Error relaciones:', errorRelaciones);
      
      // 3. Verificar todas las reseñas
      const { data: todasResenas, error: errorTodasResenas } = await supabase
        .from('Resenas')
        .select('*');
      
      console.log('📝 Todas las reseñas:', todasResenas);
      if (errorTodasResenas) console.error('❌ Error todas reseñas:', errorTodasResenas);
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  }

  /**
   * CARGAR RESEÑAS - VERSIÓN SIMPLIFICADA Y ROBUSTA
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
      console.log('🔄 Cargando reseñas para lugar ID:', this.idLugarSeleccionado);

      // PRIMERO: Verificar que tenemos un ID válido
      if (!this.idLugarSeleccionado || this.idLugarSeleccionado <= 0) {
        throw new Error('ID de lugar inválido');
      }

      // OPCIÓN A: Usar consulta directa si hay problemas con las relaciones
      console.log('🔍 Probando consulta directa...');
      
      const { data: reseñasDirectas, error: errorDirecto } = await supabase
        .from('Resenas')
        .select('*')
        .order('fecha', { ascending: false });

      if (!errorDirecto && reseñasDirectas) {
        console.log('✅ Reseñas cargadas directamente:', reseñasDirectas.length);
        // Por ahora, mostrar todas las reseñas (luego filtramos por lugar)
        this.resenas = reseñasDirectas.map(resena => this.transformarResena(resena));
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      // OPCIÓN B: Usar el método original con relaciones
      console.log('🔍 Probando con relaciones...');
      
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('Lugares_Resenas')
        .select('id_resenas')
        .eq('id_lugares', this.idLugarSeleccionado);

      if (errorRelaciones) {
        console.error('❌ Error con relaciones:', errorRelaciones);
        throw errorRelaciones;
      }

      console.log('🔗 Relaciones encontradas:', relaciones);

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

      this.resenas = (reseñasData || []).map(resena => this.transformarResena(resena));

      console.log(`✅ ${this.resenas.length} reseñas cargadas correctamente`);
      
    } catch (error: any) {
      console.error('❌ Error cargando reseñas:', error);
      await this.mostrarToast('Error al cargar reseñas: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  /**
   * AGREGAR RESEÑA - VERSIÓN MÁS ROBUSTA
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

    if (!this.idLugarSeleccionado || this.idLugarSeleccionado <= 0) {
      await this.mostrarToast('Error: No se identificó correctamente el lugar', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Publicando reseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('🔄 Iniciando creación de reseña...');

      // PASO 1: Crear la reseña en la tabla principal
      const resenaData = {
        id_usuario: 1, // Usuario temporal - cambiar por usuario real
        texto: this.nuevaResenaTexto.trim(),
        puntuacion: this.nuevaResenaRating,
        fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
      };

      console.log('📝 Datos de reseña:', resenaData);

      const { data: nuevaResena, error: errorResena } = await supabase
        .from('Resenas')
        .insert([resenaData])
        .select()
        .single();

      if (errorResena) {
        console.error('❌ Error creando reseña:', errorResena);
        throw new Error(`No se pudo crear la reseña: ${errorResena.message}`);
      }

      console.log('✅ Reseña creada con ID:', nuevaResena.id_resenas);

      // PASO 2: Crear la relación en la tabla intermedia
      const relacionData = {
        id_lugares: this.idLugarSeleccionado,
        id_resenas: nuevaResena.id_resenas
      };

      console.log('🔗 Datos de relación:', relacionData);

      const { error: errorRelacion } = await supabase
        .from('Lugares_Resenas')
        .insert([relacionData]);

      if (errorRelacion) {
        console.error('❌ Error creando relación:', errorRelacion);
        
        // Intentar eliminar la reseña creada para mantener consistencia
        await supabase
          .from('Resenas')
          .delete()
          .eq('id_resenas', nuevaResena.id_resenas);
          
        throw new Error(`No se pudo vincular la reseña al lugar: ${errorRelacion.message}`);
      }

      console.log('✅ Relación creada exitosamente');

      // PASO 3: Agregar la nueva reseña a la lista local
      const resenaParaLista = this.transformarResena(nuevaResena);
      resenaParaLista.usuario = 'Tú';
      resenaParaLista.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

      this.resenas.unshift(resenaParaLista);

      // PASO 4: Limpiar el formulario
      this.nuevaResenaTexto = '';
      this.nuevaResenaRating = 0;

      await this.mostrarToast('¡Reseña publicada con éxito!', 'success');

      // Scroll to top
      setTimeout(() => {
        const content = document.querySelector('ion-content');
        content?.scrollToTop(500);
      }, 300);

    } catch (error: any) {
      console.error('❌ Error completo al publicar reseña:', error);
      await this.mostrarToast('Error al publicar reseña: ' + error.message, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * TRANSFORMAR RESEÑA - MÉTODO AUXILIAR
   */
  private transformarResena(resena: any): Resena {
    return {
      id_resenas: resena.id_resenas,
      id_usuario: resena.id_usuario,
      texto: resena.texto || '',
      puntuacion: resena.puntuacion || 0,
      fecha: this.formatearFecha(resena.fecha),
      usuario: this.getNombreUsuario(resena.id_usuario),
      avatar: this.getRandomAvatar(resena.id_usuario),
      rating: resena.puntuacion || 0
    };
  }

  // ... (mantener los demás métodos igual)

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