import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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


type TipoEntidad = 'lugar' | 'restaurante';


@Component({
 selector: 'app-health',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './health.page.html',
 styleUrls: ['./health.page.scss']
})
export class HealthPage implements OnInit, OnDestroy {
 // Estado
 resenas: Resena[] = [];
 resenasFiltradas: Resena[] = [];
 cargando = false;
 cargandoResenas = false;
 mostrarFormulario = false;
 mostrarConfirmacionEliminar = false;
 estrellasHover = 0;


 // Contexto / navegación
 tipo: TipoEntidad = 'lugar';
 lugarId: number | null = null;
 lugarNombre = '';
 lugarCategoria = '';
 totalResenasLugar = 0;
 promedioRatingLugar = 0;


 // “Volver” dinámico
 private fromTab: string | null = null;
 private backTarget = '/tabs/capture';


 // Form
 nuevaResena: NuevaResena = { titulo: '', contenido: '', calificacion: 5 };


 // Filtros y paginación
 filtroCalificacion = '0';
 ordenamiento = 'fecha_desc';
 paginaActual = 1;
 itemsPorPagina = 10;


 // Eliminación
 resenaAEliminar: Resena | null = null;


 // Estadísticas
 promedioCalificacion = 0;
 distribucionCalificaciones: { [key: number]: number } = {};


 private routeSub: any;


 constructor(private route: ActivatedRoute, private router: Router) {}


 async ngOnInit() {
   this.routeSub = this.route.queryParams.subscribe(async (params) => {
     // Tipo de entidad
     const tipoParam = (params['tipo'] || '').toString().toLowerCase();
     this.tipo = tipoParam === 'restaurante' ? 'restaurante' : 'lugar';


     // IDs y nombres (acepta tanto params nuevos como viejos)
     if (params['lugarId']) {
       this.lugarId = parseInt(params['lugarId'], 10);
     } else if (params['id']) {
       this.lugarId = parseInt(params['id'], 10);
     } else {
       this.lugarId = null;
     }
     this.lugarNombre = params['lugarNombre'] || params['nombre'] || '';
     this.lugarCategoria = params['lugarCategoria'] || '';


     // Extras opcionales
     this.totalResenasLugar = parseInt(params['totalResenas'] || '0', 10) || 0;
     this.promedioRatingLugar = parseFloat(params['promedioRating'] || '0') || 0;


     // Back target dinámico
     this.fromTab = params['from'] ?? null;
     this.backTarget = this.fromTab === 'gastronomia' ? '/tabs/gastronomia' : '/tabs/capture';


     await this.cargarResenas();
   });
 }


 ngOnDestroy() {
   this.routeSub?.unsubscribe?.();
 }


 // ================= CARGA =================
 async cargarResenas() {
   this.cargandoResenas = true;
   try {
     if (this.lugarId) {
       await this.cargarResenasDeEntidad(this.tipo, this.lugarId);
     } else {
       await this.cargarTodasLasResenas();
     }
     this.calcularEstadisticas();
     this.aplicarFiltros();
   } catch (error) {
     console.error('Error cargando reseñas:', error);
     this.mostrarError('Error al cargar las reseñas');
   } finally {
     this.cargandoResenas = false;
   }
 }


 private async cargarResenasDeEntidad(tipo: TipoEntidad, idEntidad: number) {
   const meta =
     tipo === 'restaurante'
       ? { puente: 'restaurantes_resenas', colEntidad: 'id_gastronomia' } // usa tu PK real para restaurantes
       : { puente: 'lugares_resenas',      colEntidad: 'id_lugares'       };


   // 1) IDs de reseñas desde la tabla puente
   const { data: rels, error: eRel } = await supabase
     .from(meta.puente)
     .select('id_resenas')
     .eq(meta.colEntidad, idEntidad);


   if (eRel) {
     console.error('Error cargando relaciones:', eRel);
     this.resenas = [];
     return;
   }


   const ids = (rels || []).map((r: any) => r.id_resenas).filter((x: any) => x != null);
   if (!ids.length) { this.resenas = []; return; }


   // 2) Reseñas por IDs
   const { data: res, error: eRes } = await supabase
     .from('resenas')
     .select('*')
     .in('id_resenas', ids)
     .order('fecha', { ascending: false });


   if (eRes) {
     console.error('Error cargando reseñas:', eRes);
     this.resenas = [];
     return;
   }
   this.resenas = res || [];
 }


 private async cargarTodasLasResenas() {
   const { data, error } = await supabase
     .from('resenas')
     .select('*')
     .order('fecha', { ascending: false });
   if (error) throw error;
   this.resenas = data || [];
 }


 // =============== ESTADÍSTICAS / FILTROS / PÁGINA ===============
 private calcularEstadisticas() {
   if (!this.resenas.length) {
     this.promedioCalificacion = 0;
     this.distribucionCalificaciones = {};
     return;
   }
   const suma = this.resenas.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
   this.promedioCalificacion = suma / this.resenas.length;


   this.distribucionCalificaciones = {};
   for (let i = 1; i <= 5; i++) {
     this.distribucionCalificaciones[i] = this.resenas.filter((r) => r.puntuacion === i).length;
   }
 }


 aplicarFiltros() {
   let arr = [...this.resenas];


   if (this.filtroCalificacion !== '0') {
     const c = parseInt(this.filtroCalificacion, 10);
     arr = arr.filter((r) => r.puntuacion === c);
   }


   arr.sort((a, b) => {
     switch (this.ordenamiento) {
       case 'fecha_desc':         return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
       case 'fecha_asc':          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
       case 'calificacion_desc':  return b.puntuacion - a.puntuacion;
       case 'calificacion_asc':   return a.puntuacion - b.puntuacion;
       default:                   return 0;
     }
   });


   this.resenasFiltradas = arr;
   this.paginaActual = 1;
 }


 get totalPaginas(): number {
   return Math.ceil(this.resenasFiltradas.length / this.itemsPorPagina);
 }
 get resenasPaginadas(): Resena[] {
   const start = (this.paginaActual - 1) * this.itemsPorPagina;
   return this.resenasFiltradas.slice(start, start + this.itemsPorPagina);
 }
 paginaAnterior() { if (this.paginaActual > 1) this.paginaActual--; }
 paginaSiguiente() { if (this.paginaActual < this.totalPaginas) this.paginaActual++; }


 // ================= CREAR RESEÑA =================
 esFormularioValido(): boolean {
   return (
     this.nuevaResena.titulo.trim().length > 0 &&
     this.nuevaResena.contenido.trim().length > 0 &&
     this.nuevaResena.calificacion >= 1 &&
     this.nuevaResena.calificacion <= 5
   );
 }


 async probarAgregarResena() {
   if (this.cargando || !this.esFormularioValido()) return;
   this.cargando = true;
   await this.agregarResena();
 }


 private async agregarResena() {
   try {
     const textoCompleto = `${this.nuevaResena.titulo}: ${this.nuevaResena.contenido}`;
     const payload = {
       texto: textoCompleto,
       puntuacion: this.nuevaResena.calificacion,
       fecha: new Date().toISOString().split('T')[0], // DATE
       id_usuario: null, // evitar conflicto UUID vs INT
     };


     // 1) Crear reseña
     const { data: nueva, error: e1 } = await supabase
       .from('resenas')
       .insert([payload])
       .select('id_resenas')
       .single();
     if (e1) throw e1;


     // 2) Vincular a entidad si corresponde
     if (this.lugarId && nueva?.id_resenas) {
       const puente     = this.tipo === 'restaurante' ? 'restaurantes_resenas' : 'lugares_resenas';
       const colEntidad = this.tipo === 'restaurante' ? 'id_gastronomia'     : 'id_lugares'; // usa tu PK real
       const rel: any = { id_resenas: nueva.id_resenas };
       rel[colEntidad] = this.lugarId;


       const { error: e2 } = await supabase.from(puente).insert([rel]);
       if (e2) throw e2;
     }


     await this.cargarResenas();
     this.resetearFormulario();
     this.cerrarModal();
     this.mostrarExito('¡Reseña agregada correctamente!');
   } catch (error: any) {
     console.error('Error agregando reseña:', error);
     this.mostrarError('No se pudo agregar la reseña: ' + (error?.message || ''));
   } finally {
     this.cargando = false;
   }
 }


 private resetearFormulario() {
   this.nuevaResena = { titulo: '', contenido: '', calificacion: 5 };
   this.estrellasHover = 0;
 }


 // ================= ELIMINAR =================
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
     // Borrar vínculo en la tabla puente correcta (si estamos en una entidad)
     if (this.lugarId) {
       const puente = this.tipo === 'restaurante' ? 'restaurantes_resenas' : 'lugares_resenas';
       const { error: eRel } = await supabase
         .from(puente)
         .delete()
         .eq('id_resenas', this.resenaAEliminar.id_resenas);
       if (eRel) console.warn('Error borrando relación:', eRel);
     }


     // Borrar la reseña
     const { error } = await supabase
       .from('resenas')
       .delete()
       .eq('id_resenas', this.resenaAEliminar.id_resenas);
     if (error) throw error;


     await this.cargarResenas();
     this.mostrarExito('Reseña eliminada correctamente');
   } catch (error: any) {
     console.error('Error eliminando reseña:', error);
     this.mostrarError('No se pudo eliminar la reseña');
   } finally {
     this.cancelarEliminacion();
   }
 }


 // ================= UTILIDADES / UI =================
 obtenerTitulo(r: Resena): string {
   if (!r.texto) return 'Sin título';
   const p = r.texto.split(':');
   return p[0] || 'Sin título';
 }
 obtenerContenido(r: Resena): string {
   if (!r.texto) return 'Sin contenido';
   const p = r.texto.split(':');
   return p.slice(1).join(':').trim() || 'Sin contenido';
 }
 getTextoCalificacion(c: number): string {
   const t: any = { 1: 'Muy mala', 2: 'Mala', 3: 'Regular', 4: 'Buena', 5: 'Excelente' };
   return t[c] || 'Sin calificar';
 }


 cerrarModal() {
   this.mostrarFormulario = false;
   this.resetearFormulario();
 }


 // Back dinámico (Gastronomía si venís de ahí, si no Lugares)
 volverALugares() {
 this.router.navigate([this.backTarget]);
}


get mostrarBotonVolver(): boolean {
 return !!this.fromTab || !!this.lugarId;
}


get backLabel(): string {
 return this.fromTab === 'gastronomia'
   ? 'Volver a Gastronomía'
   : 'Volver a Lugares';
}


 private mostrarError(msg: string) { alert(`❌ ${msg}`); }
 private mostrarExito(msg: string) { alert(`✅ ${msg}`); }


 get tituloPagina(): string {
   return this.lugarId ? `Reseñas de ${this.lugarNombre}` : 'Todas las Reseñas';
 }
 get subtituloPagina(): string {
   if (this.lugarId) {
     return `${this.lugarCategoria} • ${this.resenas.length} reseñas • ${this.promedioCalificacion.toFixed(1)}/5`;
   }
   return 'Comparte tu experiencia con la comunidad';
 }
}


