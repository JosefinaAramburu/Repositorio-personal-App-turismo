import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonList, IonTextarea, IonIcon, IonBadge,
  IonFab, IonFabButton, IonSelect, IonSelectOption, IonLoading,
  IonChip, IonSearchbar, IonRefresher, IonRefresherContent, IonNote,
  AlertController, LoadingController, ToastController, NavController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  add, create, location, map, save, checkmark, close,
  time, trash, refresh, chatbubble, star, filter, search,
  business, school, leaf, water, eye, book, cart, restaurant,
  bed, informationCircle, calendar, chatbubbles
} from 'ionicons/icons';

import { supabase } from '../../supabase';

// Interfaces
export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  totalResenas: number;
  promedioRating: number;
  ultimaResena?: string;
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonList, IonTextarea, IonIcon, IonBadge,
    IonFab, IonFabButton, IonSelect, IonSelectOption, IonLoading,
    IonChip, IonSearchbar, IonRefresher, IonRefresherContent, IonNote
  ]
})
export class CapturePage implements OnInit {
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private navCtrl = inject(NavController);

  // Datos principales
  lugares: Lugar[] = [];
  lugaresFiltrados: Lugar[] = [];
  
  // Para formularios
  nuevoLugar: Lugar = {
    id_destino: 1,
    nombre: '',
    categoria: '',
    descripcion: '',
    horario: '',
    totalResenas: 0,
    promedioRating: 0
  };
  
  lugarEditando: Lugar | null = null;
  mostrarFormulario = false;
  isLoading = false;

  // Filtros
  terminoBusqueda = '';
  categoriaFiltro = 'todos';

  // Categorías disponibles
  categorias = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'Monumento', label: 'Monumentos' },
    { valor: 'Museo', label: 'Museos' },
    { valor: 'Parque', label: 'Parques' },
    { valor: 'Playa', label: 'Playas' },
    { valor: 'Mirador', label: 'Miradores' },
    { valor: 'Histórico', label: 'Históricos' },
    { valor: 'Shopping', label: 'Shopping' },
    { valor: 'Restaurante', label: 'Restaurantes' },
    { valor: 'Hotel', label: 'Hoteles' },
    { valor: 'Otro', label: 'Otros' }
  ];

  constructor() {
    addIcons({
      add, create, location, map, save, checkmark, close,
      time, trash, refresh, chatbubble, star, filter, search,
      business, school, leaf, water, eye, book, cart, restaurant,
      bed, informationCircle, calendar, chatbubbles
    });
  }

  async ngOnInit() {
    await this.cargarLugares();
  }

  // 🔄 CARGAR LUGARES DESDE SUPABASE
  async cargarLugares() {
    this.isLoading = true;
    
    try {
      console.log('🔄 Cargando lugares desde Supabase...');
      
      const { data, error } = await supabase
        .from('lugares')
        .select('*')
        .order('id_lugares', { ascending: false });

      if (error) throw error;

      // Calcular estadísticas para cada lugar
      this.lugares = await Promise.all(
        (data || []).map(async (lugar) => {
          const stats = await this.calcularEstadisticas(lugar.id_lugares!);
          return { ...lugar, ...stats };
        })
      );

      this.aplicarFiltros();
      console.log('✅ Lugares cargados:', this.lugares.length);
      
    } catch (error: any) {
      console.error('❌ Error cargando lugares:', error);
      this.mostrarError('Error al cargar lugares: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // 📊 CALCULAR ESTADÍSTICAS DE RESEÑAS PARA UN LUGAR
  async calcularEstadisticas(idLugar: number): Promise<{totalResenas: number, promedioRating: number, ultimaResena?: string}> {
    try {
      // Obtener reseñas relacionadas con este lugar
      const { data: relaciones } = await supabase
        .from('lugares_resenas')
        .select('id_resenas')
        .eq('id_lugares', idLugar);

      if (!relaciones || relaciones.length === 0) {
        return { totalResenas: 0, promedioRating: 0 };
      }

      const idsResenas = relaciones.map(rel => rel.id_resenas);
      
      // Obtener las reseñas con información completa
      const { data: resenas } = await supabase
        .from('resenas')
        .select('puntuacion, fecha, texto')
        .in('id_resenas', idsResenas)
        .order('fecha', { ascending: false });

      if (!resenas || resenas.length === 0) {
        return { totalResenas: 0, promedioRating: 0 };
      }

      const totalResenas = resenas.length;
      const sumaRatings = resenas.reduce((sum, resena) => sum + (resena.puntuacion || 0), 0);
      const promedioRating = totalResenas > 0 ? Number((sumaRatings / totalResenas).toFixed(1)) : 0;
      
      // Obtener la última reseña
      const ultimaResena = resenas.length > 0 ? resenas[0].fecha : undefined;

      return { totalResenas, promedioRating, ultimaResena };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      return { totalResenas: 0, promedioRating: 0 };
    }
  }

  // 🔍 APLICAR FILTROS Y BÚSQUEDA
  aplicarFiltros() {
    let resultados = [...this.lugares];

    // Filtrar por búsqueda
    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase();
      resultados = resultados.filter(lugar =>
        lugar.nombre.toLowerCase().includes(busqueda) ||
        (lugar.descripcion && lugar.descripcion.toLowerCase().includes(busqueda)) ||
        lugar.categoria.toLowerCase().includes(busqueda)
      );
    }

    // Filtrar por categoría
    if (this.categoriaFiltro !== 'todos') {
      resultados = resultados.filter(lugar => lugar.categoria === this.categoriaFiltro);
    }

    this.lugaresFiltrados = resultados;
  }

  onBuscarChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltros();
  }

  onCategoriaChange(categoria: string) {
    this.categoriaFiltro = categoria;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaFiltro = 'todos';
    this.aplicarFiltros();
  }

  // ➕ CREAR NUEVO LUGAR
  async crearLugar() {
    if (!this.nuevoLugar.nombre.trim() || !this.nuevoLugar.categoria.trim()) {
      this.mostrarError('Nombre y categoría son obligatorios');
      return;
    }

    try {
      const loading = await this.mostrarLoading('Creando lugar...');
      
      const { data, error } = await supabase
        .from('lugares')
        .insert([{
          id_destino: this.nuevoLugar.id_destino,
          nombre: this.nuevoLugar.nombre.trim(),
          categoria: this.nuevoLugar.categoria,
          descripcion: this.nuevoLugar.descripcion.trim(),
          horario: this.nuevoLugar.horario.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      await loading.dismiss();
      this.mostrarFormulario = false;
      this.limpiarFormulario();
      await this.cargarLugares();
      this.mostrarExito('¡Lugar creado exitosamente!');
      
    } catch (error: any) {
      await this.loadingController.dismiss();
      console.error('Error creando lugar:', error);
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  // ✏️ EDITAR LUGAR EXISTENTE
  editarLugar(lugar: Lugar) {
    this.lugarEditando = { ...lugar };
    this.mostrarFormulario = true;
  }

  async guardarEdicion() {
    if (!this.lugarEditando) return;

    try {
      const loading = await this.mostrarLoading('Actualizando lugar...');
      
      const { error } = await supabase
        .from('lugares')
        .update({
          nombre: this.lugarEditando.nombre.trim(),
          categoria: this.lugarEditando.categoria,
          descripcion: this.lugarEditando.descripcion.trim(),
          horario: this.lugarEditando.horario.trim()
        })
        .eq('id_lugares', this.lugarEditando.id_lugares);

      if (error) throw error;

      await loading.dismiss();
      this.mostrarFormulario = false;
      this.lugarEditando = null;
      await this.cargarLugares();
      this.mostrarExito('¡Lugar actualizado exitosamente!');
      
    } catch (error: any) {
      await this.loadingController.dismiss();
      console.error('Error actualizando lugar:', error);
      this.mostrarError('Error al actualizar lugar: ' + error.message);
    }
  }

  // 🗑️ ELIMINAR LUGAR CON CONFIRMACIÓN
  async eliminarLugar(id: number) {
    const alert = await this.alertController.create({
      header: '¿Eliminar lugar?',
      message: 'Se eliminarán también todas las reseñas asociadas. Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              const loading = await this.mostrarLoading('Eliminando lugar...');
              
              // Primero obtener las reseñas relacionadas
              const { data: relaciones } = await supabase
                .from('lugares_resenas')
                .select('id_resenas')
                .eq('id_lugares', id);

              // Eliminar relaciones de reseñas
              await supabase.from('lugares_resenas').delete().eq('id_lugares', id);
              
              // Luego eliminar el lugar
              const { error } = await supabase.from('lugares').delete().eq('id_lugares', id);
              if (error) throw error;

              await loading.dismiss();
              await this.cargarLugares();
              this.mostrarExito('¡Lugar eliminado exitosamente!');
              
            } catch (error: any) {
              await this.loadingController.dismiss();
              console.error('Error eliminando lugar:', error);
              this.mostrarError('Error al eliminar lugar: ' + error.message);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // 👁️ VER RESEÑAS DEL LUGAR (NAVEGA A HEALTH PAGE)
  verResenas(lugar: Lugar) {
    if (!lugar.id_lugares) {
      this.mostrarError('No se puede acceder a las reseñas de este lugar');
      return;
    }
    
    // Navegar a la página de reseñas con parámetros
    this.navCtrl.navigateForward('/tabs/health', {
      queryParams: {
        lugarId: lugar.id_lugares,
        lugarNombre: lugar.nombre,
        lugarCategoria: lugar.categoria,
        totalResenas: lugar.totalResenas,
        promedioRating: lugar.promedioRating
      }
    });
  }

  // 🎨 MÉTODOS DE UI
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

  private limpiarFormulario() {
    this.nuevoLugar = {
      id_destino: 1,
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: '',
      totalResenas: 0,
      promedioRating: 0
    };
  }

  // 🎯 MÉTODOS DE AYUDA PARA LA UI
  getCategoriaColor(categoria: string): string {
    const colores: { [key: string]: string } = {
      'Monumento': 'warning',
      'Museo': 'tertiary', 
      'Parque': 'success',
      'Playa': 'info',
      'Mirador': 'primary',
      'Histórico': 'medium',
      'Shopping': 'pink',
      'Restaurante': 'danger',
      'Hotel': 'dark',
      'Otro': 'secondary'
    };
    return colores[categoria] || 'medium';
  }

  getCategoryIcon(categoria: string): string {
    const icons: { [key: string]: string } = {
      'Monumento': 'business',
      'Museo': 'school',
      'Parque': 'leaf',
      'Playa': 'water',
      'Mirador': 'eye',
      'Histórico': 'book',
      'Shopping': 'cart',
      'Restaurante': 'restaurant',
      'Hotel': 'bed',
      'Otro': 'location'
    };
    return icons[categoria] || 'location';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  }

  formatRating(rating: number): string {
    return rating > 0 ? rating.toString() : 'Sin calificaciones';
  }

  getRelativeTime(fecha: string): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  }

  getCategoriaLabel(valor: string): string {
    const cat = this.categorias.find(c => c.valor === valor);
    return cat ? cat.label : valor;
  }

  getLugaresConResenas(): number {
    return this.lugares.filter(l => l.totalResenas > 0).length;
  }

  getPromedioGeneral(): string {
    const lugaresConRating = this.lugares.filter(l => l.promedioRating > 0);
    if (lugaresConRating.length === 0) return '0.0';
    
    const promedio = lugaresConRating.reduce((sum, l) => sum + l.promedioRating, 0) / lugaresConRating.length;
    return promedio.toFixed(1);
  }

  trackByLugar(index: number, lugar: Lugar): number {
    return lugar.id_lugares!;
  }

  // 🔄 PULL TO REFRESH
  async doRefresh(event: any) {
    await this.cargarLugares();
    event.target.complete();
  }

  // 💬 MENSAJES AL USUARIO
  private async mostrarLoading(mensaje: string) {
    const loading = await this.loadingController.create({ 
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  private async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}