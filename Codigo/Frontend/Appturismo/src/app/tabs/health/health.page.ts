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
  id: number;
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
  usuarioActualId: number = 1;

  // Variables para nombres de columnas con valores por defecto
  private columnaIdResenas: string = 'id_resenas';
  private columnaIdLugares: string = 'id_lugares';
  private columnaIdUsuario: string = 'id_usuario';
  private columnaTexto: string = 'texto';
  private columnaPuntuacion: string = 'puntuacion';
  private columnaFecha: string = 'fecha';

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
      
      await this.diagnosticarEstructuraTablas();
      await this.verificarUsuario();
      await this.cargarResenas();
    });
  }

  /**
   * DIAGNOSTICAR ESTRUCTURA DE TABLAS
   */
  async diagnosticarEstructuraTablas() {
    try {
      console.log('🔍 DIAGNÓSTICO DE ESTRUCTURA DE TABLAS');
      
      // Verificar estructura de Lugares_Resenas
      const { data: estructuraLR, error: errorLR } = await supabase
        .from('Lugares_Resenas')
        .select('*')
        .limit(1);
      
      console.log('📋 Estructura Lugares_Resenas:', estructuraLR);
      if (estructuraLR && estructuraLR.length > 0) {
        const columnas = Object.keys(estructuraLR[0]);
        console.log('📊 Columnas de Lugares_Resenas:', columnas);
        
        // Detectar nombres de columnas de forma segura
        this.detectarNombresColumnas(columnas, 'Lugares_Resenas');
      }
      if (errorLR) console.error('❌ Error Lugares_Resenas:', errorLR);
      
      // Verificar estructura de Resenas
      const { data: estructuraR, error: errorR } = await supabase
        .from('Resenas')
        .select('*')
        .limit(1);
      
      console.log('📋 Estructura Resenas:', estructuraR);
      if (estructuraR && estructuraR.length > 0) {
        const columnas = Object.keys(estructuraR[0]);
        console.log('📊 Columnas de Resenas:', columnas);
        
        // Detectar nombres de columnas de forma segura
        this.detectarNombresColumnas(columnas, 'Resenas');
      }
      if (errorR) console.error('❌ Error Resenas:', errorR);
      
      console.log('🎯 Columnas detectadas:', {
        idResenas: this.columnaIdResenas,
        idLugares: this.columnaIdLugares,
        idUsuario: this.columnaIdUsuario,
        texto: this.columnaTexto,
        puntuacion: this.columnaPuntuacion,
        fecha: this.columnaFecha
      });
      
    } catch (error) {
      console.error('❌ Error en diagnóstico de estructura:', error);
    }
  }

  /**
   * DETECTAR NOMBRES DE COLUMNAS DE FORMA SEGURA
   */
  private detectarNombresColumnas(columnas: string[], tabla: string) {
    // Para Lugares_Resenas
    if (tabla === 'Lugares_Resenas') {
      if (columnas.includes('id_resenas')) {
        this.columnaIdResenas = 'id_resenas';
      } else if (columnas.includes('id_resena')) {
        this.columnaIdResenas = 'id_resena';
      } else if (columnas.includes('resena_id')) {
        this.columnaIdResenas = 'resena_id';
      }
      
      if (columnas.includes('id_lugares')) {
        this.columnaIdLugares = 'id_lugares';
      } else if (columnas.includes('id_lugar')) {
        this.columnaIdLugares = 'id_lugar';
      } else if (columnas.includes('lugar_id')) {
        this.columnaIdLugares = 'lugar_id';
      }
    }
    
    // Para Resenas
    if (tabla === 'Resenas') {
      if (columnas.includes('id_resenas')) {
        this.columnaIdResenas = 'id_resenas';
      } else if (columnas.includes('id_resena')) {
        this.columnaIdResenas = 'id_resena';
      } else if (columnas.includes('id')) {
        this.columnaIdResenas = 'id';
      }
      
      if (columnas.includes('id_usuario')) {
        this.columnaIdUsuario = 'id_usuario';
      } else if (columnas.includes('usuario_id')) {
        this.columnaIdUsuario = 'usuario_id';
      }
      
      if (columnas.includes('texto')) {
        this.columnaTexto = 'texto';
      } else if (columnas.includes('comentario')) {
        this.columnaTexto = 'comentario';
      } else if (columnas.includes('descripcion')) {
        this.columnaTexto = 'descripcion';
      }
      
      if (columnas.includes('puntuacion')) {
        this.columnaPuntuacion = 'puntuacion';
      } else if (columnas.includes('calificacion')) {
        this.columnaPuntuacion = 'calificacion';
      } else if (columnas.includes('rating')) {
        this.columnaPuntuacion = 'rating';
      }
      
      if (columnas.includes('fecha')) {
        this.columnaFecha = 'fecha';
      } else if (columnas.includes('fecha_creacion')) {
        this.columnaFecha = 'fecha_creacion';
      } else if (columnas.includes('created_at')) {
        this.columnaFecha = 'created_at';
      }
    }
  }

  /**
   * OBTENER VALOR DE COLUMNA DE FORMA SEGURA
   */
  private obtenerValorColumna(objeto: any, columna: string): any {
    return objeto[columna];
  }

  /**
   * VERIFICAR USUARIO
   */
  async verificarUsuario() {
    try {
      console.log('🔍 Verificando usuario ID:', this.usuarioActualId);
      
      const { data: usuario, error } = await supabase
        .from('Usuario')
        .select('id_usuario')
        .eq('id_usuario', this.usuarioActualId)
        .single();

      if (error) {
        console.error('❌ Usuario no encontrado:', error);
        await this.crearUsuarioPorDefecto();
      } else {
        console.log('✅ Usuario encontrado:', usuario);
      }
      
    } catch (error) {
      console.error('❌ Error verificando usuario:', error);
      await this.crearUsuarioPorDefecto();
    }
  }

  async crearUsuarioPorDefecto() {
    try {
      console.log('🔄 Creando usuario por defecto...');
      
      const usuarioData = {
        nombre: 'Usuario',
        apellido: 'Demo',
        email: 'demo@example.com',
        contraseña: 'password123',
        fecha_nacimiento: '1990-01-01'
      };

      const { data: nuevoUsuario, error } = await supabase
        .from('Usuario')
        .insert([usuarioData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando usuario:', error);
        await this.buscarUsuarioExistente();
      } else {
        this.usuarioActualId = nuevoUsuario.id_usuario;
        console.log('✅ Usuario creado con ID:', this.usuarioActualId);
      }
      
    } catch (error) {
      console.error('❌ Error creando usuario por defecto:', error);
    }
  }

  async buscarUsuarioExistente() {
    try {
      console.log('🔍 Buscando usuario existente...');
      
      const { data: usuarios, error } = await supabase
        .from('Usuario')
        .select('id_usuario')
        .limit(1);

      if (!error && usuarios && usuarios.length > 0) {
        this.usuarioActualId = usuarios[0].id_usuario;
        console.log('✅ Usando usuario existente ID:', this.usuarioActualId);
      } else {
        console.error('❌ No hay usuarios en la base de datos');
      }
      
    } catch (error) {
      console.error('❌ Error buscando usuario existente:', error);
    }
  }

  /**
   * CARGAR RESEÑAS - VERSIÓN CORREGIDA
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

      if (!this.idLugarSeleccionado || this.idLugarSeleccionado <= 0) {
        throw new Error('ID de lugar inválido');
      }

      // Obtener relaciones usando nombres de columnas detectados
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('Lugares_Resenas')
        .select(this.columnaIdResenas)
        .eq(this.columnaIdLugares, this.idLugarSeleccionado);

      if (errorRelaciones) {
        console.error('❌ Error cargando relaciones:', errorRelaciones);
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

      // Obtener IDs de reseñas de forma segura
      const idsResenas = relaciones.map(rel => this.obtenerValorColumna(rel, this.columnaIdResenas));
      
      // Obtener reseñas usando nombres de columnas detectados
      const { data: reseñasData, error: errorResenas } = await supabase
        .from('Resenas')
        .select('*')
        .in(this.columnaIdResenas, idsResenas)
        .order(this.columnaFecha, { ascending: false });

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
   * AGREGAR RESEÑA - VERSIÓN CORREGIDA
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

    if (!this.usuarioActualId || this.usuarioActualId <= 0) {
      await this.mostrarToast('Error: No se pudo identificar el usuario', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Publicando reseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('🔄 Iniciando creación de reseña...');
      console.log('👤 Usando usuario ID:', this.usuarioActualId);

      // Crear objeto de datos de forma explícita
      const resenaData: Record<string, any> = {};
      resenaData[this.columnaIdUsuario] = this.usuarioActualId;
      resenaData[this.columnaTexto] = this.nuevaResenaTexto.trim();
      resenaData[this.columnaPuntuacion] = this.nuevaResenaRating;
      resenaData[this.columnaFecha] = new Date().toISOString().split('T')[0];

      console.log('📝 Datos de reseña:', resenaData);

      const { data: nuevaResena, error: errorResena } = await supabase
        .from('Resenas')
        .insert([resenaData])
        .select()
        .single();

      if (errorResena) {
        console.error('❌ Error creando reseña:', errorResena);
        
        if (errorResena.code === '23503') {
          await this.mostrarToast('Error: Problema con el usuario. Intentando resolver...', 'warning');
          await this.verificarUsuario();
          await loading.dismiss();
          return;
        }
        
        throw new Error(`No se pudo crear la reseña: ${errorResena.message}`);
      }

      console.log('✅ Reseña creada:', nuevaResena);

      // Crear relación
      const relacionData: Record<string, any> = {};
      relacionData[this.columnaIdLugares] = this.idLugarSeleccionado;
      relacionData[this.columnaIdResenas] = this.obtenerValorColumna(nuevaResena, this.columnaIdResenas);

      console.log('🔗 Datos de relación:', relacionData);

      const { error: errorRelacion } = await supabase
        .from('Lugares_Resenas')
        .insert([relacionData]);

      if (errorRelacion) {
        console.error('❌ Error creando relación:', errorRelacion);
        
        // Eliminar reseña creada
        await supabase
          .from('Resenas')
          .delete()
          .eq(this.columnaIdResenas, this.obtenerValorColumna(nuevaResena, this.columnaIdResenas));
          
        throw new Error(`No se pudo vincular la reseña al lugar: ${errorRelacion.message}`);
      }

      console.log('✅ Relación creada exitosamente');

      // Agregar a lista local
      const resenaParaLista = this.transformarResena(nuevaResena);
      resenaParaLista.usuario = 'Tú';
      resenaParaLista.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

      this.resenas.unshift(resenaParaLista);

      // Limpiar formulario
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
   * TRANSFORMAR RESEÑA - VERSIÓN CORREGIDA
   */
  private transformarResena(resena: any): Resena {
    return {
      id: this.obtenerValorColumna(resena, this.columnaIdResenas),
      id_usuario: this.obtenerValorColumna(resena, this.columnaIdUsuario),
      texto: this.obtenerValorColumna(resena, this.columnaTexto) || '',
      puntuacion: this.obtenerValorColumna(resena, this.columnaPuntuacion) || 0,
      fecha: this.formatearFecha(this.obtenerValorColumna(resena, this.columnaFecha)),
      usuario: this.getNombreUsuario(this.obtenerValorColumna(resena, this.columnaIdUsuario)),
      avatar: this.getRandomAvatar(this.obtenerValorColumna(resena, this.columnaIdUsuario)),
      rating: this.obtenerValorColumna(resena, this.columnaPuntuacion) || 0
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
      1: 'Usuario Demo',
      2: 'María González', 
      3: 'Carlos Rodríguez', 
      4: 'Ana Martínez',
      5: 'Javier López', 
      6: 'Tú'
    };
    return usuarios[idUsuario] || `Usuario ${idUsuario}`;
  }

  private getRandomAvatar(idUsuario: number): string {
    const avatars: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      2: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      4: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 
      5: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      6: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
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