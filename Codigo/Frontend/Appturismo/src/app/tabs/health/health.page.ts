import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// ✅ USA TU ARCHIVO SUPABASE EXISTENTE
import { supabase } from '../../supabase';

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
  lugarNombre: string = "";
  lugarCategoria: string = "";
  totalResenasLugar: number = 0;
  promedioRatingLugar: number = 0;

  // Formulario
  nuevaResena: NuevaResena = {
    titulo: "",
    contenido: "",
    calificacion: 5
  };

  // Filtros y ordenamiento
  filtroCalificacion = '0';
  ordenamiento = 'fecha_desc';
  paginaActual = 1;
  itemsPorPagina = 10;

  // Eliminacion
  resenaAEliminar: Resena | null = null;

  // Estadisticas
  promedioCalificacion = 0;
  distribucionCalificaciones: { [key: number]: number } = {};

  // Variables para el gesto de deslizar
  private swipeCoord?: [number, number];
  private swipeTime?: number;

  private routeSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(async params => {
      console.log('🔍 Parámetros recibidos en Health:', params);

      if (params['lugarId']) {
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
        this.lugarId = null;
        this.lugarNombre = '';
        console.log('🌐 Modo Todas las Resenas');
      }

      await this.cargarResenas();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  // --- GESTO DE DESLIZAR ---
  onSwipeStart(event: TouchEvent) {
    this.swipeCoord = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    this.swipeTime = new Date().getTime();
  }

  onSwipeEnd(event: TouchEvent) {
    if (!this.swipeCoord || !this.swipeTime) return;

    const coord: [number, number] = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    const time = new Date().getTime();

    const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
    const duration = time - this.swipeTime;

    // Verificar que sea un deslizamiento horizontal y rápido
    if (duration < 1000 && Math.abs(direction[0]) > 50 && Math.abs(direction[0]) > Math.abs(direction[1] * 2)) {
      if (direction[0] < 0) { // Deslizamiento hacia la izquierda - Siguiente
        this.paginaSiguiente();
      } else { // Deslizamiento hacia la derecha - Anterior
        this.paginaAnterior();
      }
    }
  }

  // --- CARGAR DATOS ---
  async cargarResenas() {
    this.cargandoResenas = true;
    try {
      console.log('📥 Cargando resenas...');
      
      if (this.lugarId) {
        await this.cargarResenasDeLugar(this.lugarId);
      } else {
        await this.cargarTodasLasResenas();
      }

      this.calcularEstadisticas();
      this.aplicarFiltros();
      console.log('✅ Resenas cargadas:', this.resenas.length);

    } catch (error) {
      console.error('❌ Error cargando resenas:', error);
      this.mostrarError('Error al cargar las resenas');
    } finally {
      this.cargandoResenas = false;
    }
  }

  // Cargar resenas de un lugar específico
  private async cargarResenasDeLugar(lugarId: number) {
    console.log(`🔍 Buscando resenas para lugar ID: ${lugarId}`);

    try {
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('lugares_resenas')
        .select('id_resenas')
        .eq('id_lugares', lugarId);

      if (errorRelaciones) {
        console.error('❌ Error cargando relaciones:', errorRelaciones);
        this.resenas = [];
        return;
      }

      console.log('📋 Relaciones encontradas:', relaciones);

      if (!relaciones || relaciones.length === 0) {
        console.log('ℹ️ No hay resenas específicas para este lugar');
        this.resenas = [];
        return;
      }

      const idsResenas = relaciones.map(rel => rel.id_resenas);
      console.log('🆔 IDs de resenas:', idsResenas);

      const { data: resenas, error: errorResenas } = await supabase
        .from('resenas')
        .select('*')
        .in('id_resenas', idsResenas)
        .order('fecha', { ascending: false });

      if (errorResenas) {
        console.error('❌ Error cargando resenas:', errorResenas);
        throw errorResenas;
      }

      this.resenas = resenas || [];
      console.log(`✅ ${this.resenas.length} resenas cargadas para lugar ${lugarId}`);

    } catch (error) {
      console.error('❌ Error en cargarResenasDeLugar:', error);
      this.resenas = [];
    }
  }

  private async cargarTodasLasResenas() {
    try {
      console.log('🌐 Cargando TODAS las resenas...');
      const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('❌ Error cargando todas las resenas:', error);
        throw error;
      }

      this.resenas = data || [];
      console.log(`✅ ${this.resenas.length} resenas cargadas (todas)`);
    } catch (error) {
      console.error('❌ Error en cargarTodasLasResenas:', error);
      this.resenas = [];
    }
  }

  private calcularEstadisticas() {
    if (this.resenas.length === 0) {
      this.promedioCalificacion = 0;
      this.distribucionCalificaciones = {};
      return;
    }

    const suma = this.resenas.reduce((acc, resena) => acc + resena.puntuacion, 0);
    this.promedioCalificacion = suma / this.resenas.length;

    this.distribucionCalificaciones = {};
    for (let i = 1; i <= 5; i++) {
      this.distribucionCalificaciones[i] = this.resenas.filter(r => r.puntuacion === i).length;
    }

    console.log('📊 Estadísticas calculadas:', {
      promedio: this.promedioCalificacion,
      distribucion: this.distribucionCalificaciones
    });
  }

  aplicarFiltros() {
    let resenasFiltradas = [...this.resenas];

    if (this.filtroCalificacion !== '0') {
      const calificacion = parseInt(this.filtroCalificacion);
      resenasFiltradas = resenasFiltradas.filter(
        resena => resena.puntuacion === calificacion
      );
    }

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
    console.log(`🔍 Filtros aplicados: ${this.resenasFiltradas.length} resenas`);
  }

  get totalPaginas(): number {
    return Math.ceil(this.resenasFiltradas.length / this.itemsPorPagina);
  }

  get resenasPaginadas(): Resena[] {
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    const endIndex = startIndex + this.itemsPorPagina;
    return this.resenasFiltradas.slice(startIndex, endIndex);
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
      console.log('🚀 Iniciando agregarResena...');
      
      const textoCompleto = `${this.nuevaResena.titulo}: ${this.nuevaResena.contenido}`;

      const datosParaSupabase = {
        texto: textoCompleto,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0],
        id_usuario: null
      };

      const { data: resenaCreada, error: errorResena } = await supabase
        .from('resenas')
        .insert([datosParaSupabase])
        .select()
        .single();

      if (errorResena) {
        console.error('❌ Error creando resena:', errorResena);
        this.mostrarError('Error al crear resena: ' + errorResena.message);
        return;
      }

      console.log('✅ Resena creada:', resenaCreada);

      if (this.lugarId && resenaCreada) {
        console.log(`🔗 Creando relación: lugar ${this.lugarId} - resena ${resenaCreada.id_resenas}`);

        const { error: errorRelacion } = await supabase
          .from('lugares_resenas')
          .insert([{
            id_lugares: this.lugarId,
            id_resenas: resenaCreada.id_resenas
          }]);

        if (errorRelacion) {
          console.error('❌ Error creando relación:', errorRelacion);
          this.mostrarError('Error al vincular resena con el lugar: ' + errorRelacion.message);
          return;
        }
      }

      await this.cargarResenas();

      this.resetearFormulario();
      this.cerrarModal();
      this.mostrarExito('¡Reseña agregada correctamente!');

    } catch (error: any) {
      console.error('❌ Error general:', error);
      this.mostrarError('Error inesperado al agregar resena: ' + error.message);
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
      console.log('🗑️ Eliminando resena:', this.resenaAEliminar.id_resenas);

      const { error: errorRelacion } = await supabase
        .from('lugares_resenas')
        .delete()
        .eq('id_resenas', this.resenaAEliminar.id_resenas);

      if (errorRelacion) {
        console.error('⚠️ Error eliminando relación:', errorRelacion);
      }

      const { error } = await supabase
        .from('resenas')
        .delete()
        .eq('id_resenas', this.resenaAEliminar.id_resenas);

      if (error) {
        console.error('❌ Error eliminando resena:', error);
        this.mostrarError('Error al eliminar resena');
        return;
      }

      console.log('✅ Resena eliminada exitosamente');
      await this.cargarResenas();
      this.mostrarExito('Reseña eliminada correctamente');

    } catch (error: any) {
      console.error('❌ Error general eliminando:', error);
      this.mostrarError('Error inesperado al eliminar resena: ' + error.message);
    } finally {
      this.cancelarEliminacion();
    }
  }

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
    const textos: { [key: number]: string } = {
      1: 'Muy mala',
      2: 'Mala',
      3: 'Regular',
      4: 'Buena',
      5: 'Excelente'
    };
    return textos[calificacion] || 'Sin calificar';
  }

  cerrarModal() {
    this.mostrarFormulario = false;
    this.resetearFormulario();
  }

  volverALugares() {
    this.router.navigate(['/tabs/capture']);
  }

  private mostrarError(mensaje: string) {
    alert(`❌ ${mensaje}`);
  }

  private mostrarExito(mensaje: string) {
    alert(`✅ ${mensaje}`);
  }

  get tituloPagina(): string {
    return this.lugarId ? `Reseñas de ${this.lugarNombre}` : 'Todas las Reseñas';
  }

  get subtituloPagina(): string {
    if (this.lugarId) {
      return `${this.lugarCategoria} • ${this.resenas.length} reseñas • ${this.promedioCalificacion.toFixed(1)}/5`;
    }
    return 'Comparte tu experiencia con la comunidad';
  }

  get mostrarBotonVolver(): boolean {
    return !!this.lugarId;
  }
}