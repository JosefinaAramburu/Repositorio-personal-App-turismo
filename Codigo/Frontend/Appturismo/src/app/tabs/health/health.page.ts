import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Resena {
  id_resenas: number;
  texto: string;
  puntuacion: number;
  fecha: string;
  id_usuario: number | null;
}

interface NuevaResena {
  titulo: string;
  contenido: string;
  calificacion: number;
}

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss']
})
export class HealthPage implements OnInit, OnDestroy {
  // Estado de la aplicación
  resenas: Resena[] = [];
  resenasFiltradas: Resena[] = [];
  cargando = false;
  cargandoResenas = false;
  mostrarFormulario = false;
  mostrarConfirmacionEliminar = false;
  estrellasHover = 0;

  // Información del lugar (si viene desde capture)
  lugarId: number | null = null;
  lugarNombre: string = '';
  lugarCategoria: string = '';
  totalResenasLugar: number = 0;
  promedioRatingLugar: number = 0;

  // Formulario
  nuevaResena: NuevaResena = {
    titulo: '',
    contenido: '',
    calificacion: 5
  };

  // Filtros y ordenamiento
  filtroCalificacion = '0';
  ordenamiento = 'fecha_desc';
  paginaActual = 1;
  itemsPorPagina = 6;

  // Eliminación
  resenaAEliminar: Resena | null = null;

  // Estadísticas
  promedioCalificacion = 0;
  distribucionCalificaciones: { [key: number]: number } = {};

  private supabase: SupabaseClient;
  private routeSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.supabase = createClient(
      'https://xqznsyyloofllzkywohl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxem5zeXlsb29mbGx6a3l3b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDk4MTksImV4cCI6MjA3MDY4NTgxOX0.rqIz8miQTNRPLWuNXE4LDwCQY2UT-f6IgRBaChszeOk'
    );
  }

  async ngOnInit() {
    // Escuchar parámetros de la URL
    this.routeSub = this.route.queryParams.subscribe(params => {
      console.log('📋 Parámetros recibidos:', params);
      
      if (params['lugarId']) {
        // Modo: Reseñas de un lugar específico
        this.lugarId = parseInt(params['lugarId']);
        this.lugarNombre = params['lugarNombre'] || 'Lugar Desconocido';
        this.lugarCategoria = params['lugarCategoria'] || '';
        this.totalResenasLugar = parseInt(params['totalResenas']) || 0;
        this.promedioRatingLugar = parseFloat(params['promedioRating']) || 0;
        
        console.log('📍 Modo Lugar Específico:', {
          lugarId: this.lugarId,
          lugarNombre: this.lugarNombre,
          categoria: this.lugarCategoria
        });
      } else {
        // Modo: Todas las reseñas
        this.lugarId = null;
        this.lugarNombre = '';
        console.log('🌐 Modo Todas las Reseñas');
      }
      
      this.cargarResenas();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  // ========== CARGAR DATOS ==========
  async cargarResenas() {
    this.cargandoResenas = true;
    try {
      console.log('🔄 Cargando reseñas...');
      
      if (this.lugarId) {
        // 🔍 MODO: Reseñas de un lugar específico
        await this.cargarResenasDeLugar(this.lugarId);
      } else {
        // 🌐 MODO: Todas las reseñas
        await this.cargarTodasLasResenas();
      }
      
      this.calcularEstadisticas();
      this.aplicarFiltros();
      
    } catch (error) {
      console.error('❌ Error general cargando reseñas:', error);
      this.mostrarError('Error al cargar las reseñas');
    } finally {
      this.cargandoResenas = false;
    }
  }

  // 🔍 Cargar reseñas de un lugar específico
  private async cargarResenasDeLugar(lugarId: number) {
    console.log(`🔍 Buscando reseñas para lugar ID: ${lugarId}`);
    
    // 1. Obtener los IDs de reseñas relacionadas con este lugar
    const { data: relaciones, error: errorRelaciones } = await this.supabase
      .from('lugares_resenas')
      .select('id_resenas')
      .eq('id_lugares', lugarId);

    if (errorRelaciones) {
      console.error('❌ Error cargando relaciones:', errorRelaciones);
      throw errorRelaciones;
    }

    console.log(`📊 Relaciones encontradas:`, relaciones);

    if (!relaciones || relaciones.length === 0) {
      console.log('ℹ️ No hay reseñas para este lugar');
      this.resenas = [];
      return;
    }

    const idsResenas = relaciones.map(rel => rel.id_resenas);
    
    // 2. Obtener las reseñas usando los IDs
    const { data: resenas, error: errorResenas } = await this.supabase
      .from('resenas')
      .select('*')
      .in('id_resenas', idsResenas)
      .order('fecha', { ascending: false });

    if (errorResenas) {
      console.error('❌ Error cargando reseñas:', errorResenas);
      throw errorResenas;
    }

    this.resenas = resenas || [];
    console.log(`✅ Reseñas cargadas para lugar ${lugarId}:`, this.resenas.length);
  }

  // 🌐 Cargar todas las reseñas
  private async cargarTodasLasResenas() {
    const { data, error } = await this.supabase
      .from('resenas')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('❌ Error cargando todas las reseñas:', error);
      throw error;
    }

    this.resenas = data || [];
    console.log('✅ Todas las reseñas cargadas:', this.resenas.length);
  }

  // ========== ESTADÍSTICAS ==========
  private calcularEstadisticas() {
    if (this.resenas.length === 0) {
      this.promedioCalificacion = 0;
      this.distribucionCalificaciones = {};
      return;
    }

    // Calcular promedio
    const suma = this.resenas.reduce((acc, resena) => acc + resena.puntuacion, 0);
    this.promedioCalificacion = suma / this.resenas.length;

    // Calcular distribución
    this.distribucionCalificaciones = {};
    this.resenas.forEach(resena => {
      this.distribucionCalificaciones[resena.puntuacion] = 
        (this.distribucionCalificaciones[resena.puntuacion] || 0) + 1;
    });
  }

  // ========== FILTROS Y ORDENAMIENTO ==========
  aplicarFiltros() {
    let resenasFiltradas = [...this.resenas];

    // Aplicar filtro de calificación
    if (this.filtroCalificacion !== '0') {
      const calificacion = parseInt(this.filtroCalificacion);
      resenasFiltradas = resenasFiltradas.filter(
        resena => resena.puntuacion === calificacion
      );
    }

    // Aplicar ordenamiento
    resenasFiltradas.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'fecha_desc':
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case 'fecha_asc':
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case 'calificacion_desc':
          return b.puntuacion - a.puntuacion;
        case 'calificacion_asc':
          return a.puntuacion - b.puntuacion;
        default:
          return 0;
      }
    });

    this.resenasFiltradas = resenasFiltradas;
    this.paginaActual = 1;
  }

  limpiarFiltros() {
    this.filtroCalificacion = '0';
    this.ordenamiento = 'fecha_desc';
    this.aplicarFiltros();
  }

  // ========== PAGINACIÓN ==========
  get totalPaginas(): number {
    return Math.ceil(this.resenasFiltradas.length / this.itemsPorPagina);
  }

  get resenasPaginadas(): Resena[] {
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.resenasFiltradas.slice(startIndex, startIndex + this.itemsPorPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  // ========== FORMULARIO ==========
  esFormularioValido(): boolean {
    return this.nuevaResena.titulo.trim().length > 0 && 
           this.nuevaResena.contenido.trim().length > 0 &&
           this.nuevaResena.calificacion >= 1 &&
           this.nuevaResena.calificacion <= 5;
  }

  async probarAgregarResena() {
    if (this.cargando || !this.esFormularioValido()) {
      return;
    }

    this.cargando = true;
    await this.agregarResena();
  }

  async agregarResena() {
    try {
      console.log('🔄 Agregando reseña...');

      // 1. Crear la reseña en la tabla 'resenas'
      const datosParaSupabase = {
        texto: `${this.nuevaResena.titulo}: ${this.nuevaResena.contenido}`,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0],
        id_usuario: null
      };

      console.log('📤 Creando reseña:', datosParaSupabase);

      const { data: resenaCreada, error: errorResena } = await this.supabase
        .from('resenas')
        .insert([datosParaSupabase])
        .select()
        .single();

      if (errorResena) {
        console.error('❌ Error creando reseña:', errorResena);
        this.mostrarError('Error al crear reseña: ' + errorResena.message);
        return;
      }

      console.log('✅ Reseña creada:', resenaCreada);

      // 2. Si estamos en modo lugar específico, crear la relación
      if (this.lugarId && resenaCreada) {
        await this.crearRelacionLugarResena(this.lugarId, resenaCreada.id_resenas);
      }

      // 3. Recargar lista y resetear formulario
      await this.cargarResenas();
      this.resetearFormulario();
      this.cerrarModal();
      
      this.mostrarExito('Reseña agregada correctamente!');

    } catch (error) {
      console.error('❌ Error general:', error);
      this.mostrarError('Error inesperado al agregar reseña');
    } finally {
      this.cargando = false;
    }
  }

  // 🔗 Crear relación entre lugar y reseña
  private async crearRelacionLugarResena(lugarId: number, resenaId: number) {
    try {
      console.log(`🔗 Creando relación: Lugar ${lugarId} - Reseña ${resenaId}`);
      
      const { error } = await this.supabase
        .from('lugares_resenas')
        .insert([{
          id_lugares: lugarId,
          id_resenas: resenaId
        }]);

      if (error) {
        console.error('❌ Error creando relación:', error);
        throw error;
      }

      console.log('✅ Relación creada exitosamente');
    } catch (error) {
      console.error('❌ Error en crearRelacionLugarResena:', error);
      throw error;
    }
  }

  private resetearFormulario() {
    this.nuevaResena = {
      titulo: '',
      contenido: '',
      calificacion: 5
    };
    this.estrellasHover = 0;
  }

  // ========== ELIMINACIÓN ==========
  confirmarEliminacion(resena: Resena) {
    this.resenaAEliminar = resena;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminacion() {
    this.resenaAEliminar = null;
    this.mostrarConfirmacionEliminar = false;
  }

  async eliminarResenaConfirmada() {
    if (!this.resenaAEliminar) return;

    try {
      console.log('🔄 Eliminando reseña:', this.resenaAEliminar.id_resenas);

      // 1. Primero eliminar relaciones en lugares_resenas (si existen)
      if (this.lugarId) {
        await this.supabase
          .from('lugares_resenas')
          .delete()
          .eq('id_resenas', this.resenaAEliminar.id_resenas)
          .eq('id_lugares', this.lugarId);
      }

      // 2. Luego eliminar la reseña
      const { error } = await this.supabase
        .from('resenas')
        .delete()
        .eq('id_resenas', this.resenaAEliminar.id_resenas);

      if (error) {
        console.error('❌ Error eliminando reseña:', error);
        this.mostrarError('Error al eliminar reseña');
        return;
      }

      console.log('✅ Reseña eliminada exitosamente');
      await this.cargarResenas();
      this.mostrarExito('Reseña eliminada correctamente');

    } catch (error) {
      console.error('❌ Error general eliminando:', error);
      this.mostrarError('Error inesperado al eliminar reseña');
    } finally {
      this.cancelarEliminacion();
    }
  }

  // ========== UTILIDADES ==========
  obtenerTitulo(resena: Resena): string {
    if (!resena.texto) return 'Sin título';
    const partes = resena.texto.split(':');
    return partes[0] || 'Sin título';
  }

  obtenerContenido(resena: Resena): string {
    if (!resena.texto) return 'Sin contenido';
    const partes = resena.texto.split(':');
    return partes.slice(1).join(':').trim() || 'Sin contenido';
  }

  getTextoCalificacion(calificacion: number): string {
    const textos = {
      1: 'Muy mala',
      2: 'Mala',
      3: 'Regular',
      4: 'Buena',
      5: 'Excelente'
    };
    return textos[calificacion as keyof typeof textos] || 'Sin calificar';
  }

  // ========== MODALES ==========
  cerrarModal() {
    this.mostrarFormulario = false;
    this.resetearFormulario();
  }

  // ========== NAVEGACIÓN ==========
  volverALugares() {
    this.router.navigate(['/tabs/capture']);
  }

  // ========== NOTIFICACIONES ==========
  private mostrarError(mensaje: string) {
    alert(`❌ ${mensaje}`);
  }

  private mostrarExito(mensaje: string) {
    alert(`✅ ${mensaje}`);
  }

  // ========== GETTERS PARA LA VISTA ==========
  get tituloPagina(): string {
    return this.lugarId ? `Reseñas de ${this.lugarNombre}` : 'Todas las Reseñas';
  }

  get subtituloPagina(): string {
    return this.lugarId ? 
      `${this.lugarCategoria} • ${this.totalResenasLugar} reseñas • ⭐ ${this.promedioRatingLugar}` :
      'Comparte tu experiencia con la comunidad';
  }

  get mostrarBotonVolver(): boolean {
    return !!this.lugarId;
  }
}