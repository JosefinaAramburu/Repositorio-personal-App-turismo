import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor() {
    this.supabase = createClient(
      'https://xqznsyyloofllzkywohl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxem5zeXlsb29mbGx6a3l3b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDk4MTksImV4cCI6MjA3MDY4NTgxOX0.rqIz8miQTNRPLWuNXE4LDwCQY2UT-f6IgRBaChszeOk'
    );
  }

  async ngOnInit() {
    await this.cargarResenas();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  // ========== CARGAR DATOS ==========
  async cargarResenas() {
    this.cargandoResenas = true;
    try {
      console.log('🔄 Cargando reseñas desde Supabase...');
      
      const { data, error } = await this.supabase
        .from('resenas')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('❌ Error cargando reseñas:', error);
        throw error;
      }

      this.resenas = data || [];
      console.log('✅ Reseñas cargadas:', this.resenas.length);
      
      this.calcularEstadisticas();
      this.aplicarFiltros();
      
    } catch (error) {
      console.error('❌ Error general cargando reseñas:', error);
      this.mostrarError('Error al cargar las reseñas');
    } finally {
      this.cargandoResenas = false;
    }
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
      console.log('🔄 Agregando reseña a Supabase...');

      // Formatear datos según tu estructura de base de datos
      const datosParaSupabase = {
        texto: `${this.nuevaResena.titulo}: ${this.nuevaResena.contenido}`,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        id_usuario: null // Como permitiste NULL en tu ALTER TABLE
      };

      console.log('📤 Enviando a Supabase:', datosParaSupabase);

      const { data, error } = await this.supabase
        .from('resenas')
        .insert([datosParaSupabase])
        .select();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        this.mostrarError('Error al agregar reseña: ' + error.message);
        return;
      }

      console.log('✅ Reseña agregada exitosamente:', data);
      
      // Recargar lista y resetear formulario
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

  // ========== NOTIFICACIONES ==========
  private mostrarError(mensaje: string) {
    // Puedes implementar un sistema de notificaciones más elegante
    alert(`❌ ${mensaje}`);
  }

  private mostrarExito(mensaje: string) {
    // Puedes implementar un sistema de notificaciones más elegante
    alert(`✅ ${mensaje}`);
  }
}