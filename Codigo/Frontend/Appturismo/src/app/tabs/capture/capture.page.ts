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
  IonChip,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
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
  star,
  businessOutline,
  libraryOutline,
  leafOutline,
  waterOutline,
  restaurantOutline,
  cafeOutline,
  eyeOutline,
  cartOutline,
  filterOutline,
  searchOutline,
  trendingUpOutline,
  trophyOutline,
  heartOutline
} from 'ionicons/icons';

import { Injectable } from '@angular/core';
import { supabase } from '../../supabase';

// Constantes para nombres de tablas (EXACTAMENTE como están en tu SQL)
const TABLES = {
  LUGARES: 'lugares',
  LUGARES_RESENAS: 'lugares_resenas',
  RESENAS: 'resenas',
  DESTINO: 'destino'
};

export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  // Estos no están en la tabla, se calculan
  totalResenas: number;
  promedioRating: number;
}

export interface Estadisticas {
  totalLugares: number;
  totalResenas: number;
  promedioGeneral: number;
  categoriaPopular: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  
  async crearLugar(lugar: Lugar): Promise<any> {
    console.log('🔄 Creando lugar:', lugar);
    
    // Solo los campos que existen en tu tabla 'lugares'
    const lugarParaInsertar = {
      id_destino: lugar.id_destino,
      nombre: lugar.nombre.trim(),
      categoria: lugar.categoria,
      descripcion: lugar.descripcion.trim(),
      horario: lugar.horario.trim()
      // NO incluir totalResenas, promedioRating ni fecha_creacion
    };
    
    const { data, error } = await supabase
      .from(TABLES.LUGARES)
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

  async obtenerLugares(filtroCategoria?: string, busqueda?: string): Promise<Lugar[]> {
    console.log('🔄 Obteniendo lugares...');
    
    let query = supabase
      .from(TABLES.LUGARES)
      .select('*'); // Solo campos existentes

    // Aplicar filtros si existen
    if (filtroCategoria && filtroCategoria !== 'todos') {
      query = query.eq('categoria', filtroCategoria);
    }

    if (busqueda && busqueda.trim()) {
      query = query.or(`nombre.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error obteniendo lugares:', error);
      throw new Error(`Error al obtener lugares: ${error.message}`);
    }
    
    // Calcular estadísticas de reseñas para cada lugar
    const lugaresConResenas = await Promise.all(
      (data || []).map(async (lugar) => {
        const estadisticas = await this.obtenerEstadisticasResenas(lugar.id_lugares!);
        return {
          ...lugar,
          totalResenas: estadisticas.totalResenas || 0,
          promedioRating: estadisticas.promedioRating || 0
        };
      })
    );
    
    return lugaresConResenas;
  }

  async obtenerEstadisticas(): Promise<Estadisticas> {
    try {
      // Total de lugares
      const { count: totalLugares, error: errorLugares } = await supabase
        .from(TABLES.LUGARES)
        .select('*', { count: 'exact', head: true });

      // Total de reseñas (de la tabla resenas)
      const { count: totalResenas, error: errorResenas } = await supabase
        .from(TABLES.RESENAS)
        .select('*', { count: 'exact', head: true });

      // Promedio general de todas las reseñas
      const { data: todasResenas, error: errorTodasResenas } = await supabase
        .from(TABLES.RESENAS)
        .select('puntuacion');

      const promedioGeneral = todasResenas && todasResenas.length > 0 
        ? Number((todasResenas.reduce((sum, resena) => sum + (resena.puntuacion || 0), 0) / todasResenas.length).toFixed(1))
        : 0;

      // Categoría más popular
      const { data: categorias, error: errorCategorias } = await supabase
        .from(TABLES.LUGARES)
        .select('categoria');

      let categoriaPopular = 'No hay datos';
      if (categorias && categorias.length > 0) {
        const categoriaCount = categorias.reduce((acc, lugar) => {
          acc[lugar.categoria] = (acc[lugar.categoria] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        categoriaPopular = Object.keys(categoriaCount).reduce((a, b) => 
          categoriaCount[a] > categoriaCount[b] ? a : b
        );
      }

      return {
        totalLugares: totalLugares || 0,
        totalResenas: totalResenas || 0,
        promedioGeneral,
        categoriaPopular
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalLugares: 0,
        totalResenas: 0,
        promedioGeneral: 0,
        categoriaPopular: 'No hay datos'
      };
    }
  }

  async obtenerEstadisticasResenas(idLugar: number): Promise<{totalResenas: number, promedioRating: number}> {
    try {
      // Obtener las reseñas relacionadas con este lugar
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from(TABLES.LUGARES_RESENAS)
        .select('id_resenas')
        .eq('id_lugares', idLugar);

      if (errorRelaciones || !relaciones || relaciones.length === 0) {
        return { totalResenas: 0, promedioRating: 0 };
      }

      const idsResenas = relaciones.map(rel => rel.id_resenas);
      
      // Obtener las reseñas específicas
      const { data: resenas, error: errorResenas } = await supabase
        .from(TABLES.RESENAS)
        .select('puntuacion')
        .in('id_resenas', idsResenas);

      if (errorResenas || !resenas) {
        return { totalResenas: 0, promedioRating: 0 };
      }

      const totalResenas = resenas.length;
      const sumaRatings = resenas.reduce((sum, resena) => sum + (resena.puntuacion || 0), 0);
      const promedioRating = totalResenas > 0 ? Number((sumaRatings / totalResenas).toFixed(1)) : 0;

      return { totalResenas, promedioRating };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      return { totalResenas: 0, promedioRating: 0 };
    }
  }

  async actualizarLugar(id: number, updates: Partial<Lugar>): Promise<any> {
    console.log('🔄 Actualizando lugar', id, updates);
    
    // Solo campos editables que existen en la tabla
    const { totalResenas, promedioRating, ...camposEditables } = updates;
    
    // Limpiar campos antes de actualizar
    if (camposEditables.nombre) camposEditables.nombre = camposEditables.nombre.trim();
    if (camposEditables.descripcion) camposEditables.descripcion = camposEditables.descripcion.trim();
    if (camposEditables.horario) camposEditables.horario = camposEditables.horario.trim();
    
    const { data, error } = await supabase
      .from(TABLES.LUGARES)
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
    
    // Primero eliminar las relaciones de reseñas
    const { error: errorRelaciones } = await supabase
      .from(TABLES.LUGARES_RESENAS)
      .delete()
      .eq('id_lugares', id);
    
    if (errorRelaciones) {
      console.error('❌ Error eliminando relaciones de reseñas:', errorRelaciones);
    }
    
    // Luego eliminar el lugar
    const { error } = await supabase
      .from(TABLES.LUGARES)
      .delete()
      .eq('id_lugares', id);
    
    if (error) {
      console.error('❌ Error eliminando lugar:', error);
      throw new Error(`Error al eliminar lugar: ${error.message}`);
    }
  }

  // Método para obtener el destino por defecto
  async obtenerDestinoPorDefecto(): Promise<number> {
    const { data, error } = await supabase
      .from(TABLES.DESTINO)
      .select('id_destino')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error('Error obteniendo destino por defecto');
      return 1; // Valor por defecto
    }
    
    return data[0].id_destino;
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
    IonLoading,
    IonChip,
    IonSearchbar,
    IonSegment,
    IonSegmentButton
  ],
  providers: [CaptureService]
})
export class CapturePage implements OnInit {
  private captureService = inject(CaptureService);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private navCtrl = inject(NavController);

  // Estados
  lugares: Lugar[] = [];
  lugaresFiltrados: Lugar[] = [];
  nuevoLugar: Lugar = {
    id_destino: 1, // Valor por defecto
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

  // Filtros y búsqueda
  terminoBusqueda = '';
  categoriaFiltro = 'todos';
  mostrarEstadisticas = false;
  estadisticas: Estadisticas = {
    totalLugares: 0,
    totalResenas: 0,
    promedioGeneral: 0,
    categoriaPopular: ''
  };

  // Categorías disponibles (basadas en tus opciones)
  categorias = [
    { valor: 'todos', label: 'Todos', icon: 'location-outline' },
    { valor: 'Monumento', label: 'Monumentos', icon: 'business-outline' },
    { valor: 'Museo', label: 'Museos', icon: 'library-outline' },
    { valor: 'Parque', label: 'Parques', icon: 'leaf-outline' },
    { valor: 'Playa', label: 'Playas', icon: 'water-outline' },
    { valor: 'Restaurante', label: 'Restaurantes', icon: 'restaurant-outline' },
    { valor: 'Cafetería', label: 'Cafeterías', icon: 'cafe-outline' },
    { valor: 'Mirador', label: 'Miradores', icon: 'eye-outline' },
    { valor: 'Histórico', label: 'Históricos', icon: 'time-outline' },
    { valor: 'Shopping', label: 'Shopping', icon: 'cart-outline' },
    { valor: 'Otro', label: 'Otros', icon: 'location-outline' }
  ];

  // Mapeos para categorías
  private categoriaIconMap: { [key: string]: string } = {
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

  private categoriaClassMap: { [key: string]: string } = {
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

  private categoriaColorMap: { [key: string]: string } = {
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
      star,
      businessOutline,
      libraryOutline,
      leafOutline,
      waterOutline,
      restaurantOutline,
      cafeOutline,
      eyeOutline,
      cartOutline,
      filterOutline,
      searchOutline,
      trendingUpOutline,
      trophyOutline,
      heartOutline
    });
  }

  async ngOnInit() {
    await this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    // Obtener el destino por defecto primero
    try {
      const idDestino = await this.captureService.obtenerDestinoPorDefecto();
      this.nuevoLugar.id_destino = idDestino;
    } catch (error) {
      console.error('Error obteniendo destino por defecto:', error);
    }

    await Promise.all([
      this.cargarLugares(),
      this.cargarEstadisticas()
    ]);
  }

  // Métodos de UI
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

  toggleEstadisticas() {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
    if (this.mostrarEstadisticas) {
      this.cargarEstadisticas();
    }
  }

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

  // Métodos de datos
  async cargarLugares() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      this.lugares = await this.captureService.obtenerLugares(
        this.categoriaFiltro !== 'todos' ? this.categoriaFiltro : undefined,
        this.terminoBusqueda.trim() || undefined
      );
      this.aplicarFiltros();
    } catch (error: any) {
      this.mostrarError('Error al cargar lugares: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  async cargarEstadisticas() {
    try {
      this.estadisticas = await this.captureService.obtenerEstadisticas();
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  aplicarFiltros() {
    let lugaresFiltrados = [...this.lugares];

    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase().trim();
      lugaresFiltrados = lugaresFiltrados.filter(lugar =>
        lugar.nombre.toLowerCase().includes(busqueda) ||
        (lugar.descripcion && lugar.descripcion.toLowerCase().includes(busqueda)) ||
        lugar.categoria.toLowerCase().includes(busqueda)
      );
    }

    if (this.categoriaFiltro !== 'todos') {
      lugaresFiltrados = lugaresFiltrados.filter(lugar => 
        lugar.categoria === this.categoriaFiltro
      );
    }

    this.lugaresFiltrados = lugaresFiltrados;
  }

  onBuscarChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltros();
  }

  onCategoriaChange(event: any) {
    this.categoriaFiltro = event.detail.value;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaFiltro = 'todos';
    this.aplicarFiltros();
  }

  async crearLugar() {
    if (!this.validarFormulario()) return;

    try {
      const loading = await this.mostrarLoading('Creando lugar...');
      
      await this.captureService.crearLugar(this.nuevoLugar);
      
      this.limpiarFormulario();
      await this.cargarDatosIniciales();
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
      const loading = await this.mostrarLoading('Actualizando lugar...');
      
      await this.captureService.actualizarLugar(this.lugarEditando.id_lugares!, this.lugarEditando);
      
      this.lugarEditando = null;
      this.mostrarFormulario = false;
      await this.cargarDatosIniciales();
      
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
              const loading = await this.mostrarLoading('Eliminando lugar...');
              
              await this.captureService.eliminarLugar(id);
              await this.cargarDatosIniciales();
              
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

  // Métodos de utilidad
  getCategoriaIcon(categoria: string): string {
    return this.categoriaIconMap[categoria] || 'location-outline';
  }

  getCategoriaClass(categoria: string): string {
    return this.categoriaClassMap[categoria] || 'otro';
  }

  getCategoriaColor(categoria: string): string {
    return this.categoriaColorMap[categoria] || 'medium';
  }

  getLugaresDestacados(): Lugar[] {
    return this.lugaresFiltrados
      .filter(lugar => lugar.promedioRating >= 4)
      .slice(0, 3);
  }

  trackByLugar(index: number, lugar: Lugar): number {
    return lugar.id_lugares!;
  }

  // Métodos privados
  private validarFormulario(): boolean {
    if (!this.nuevoLugar.nombre?.trim()) {
      this.mostrarError('El nombre del lugar es obligatorio');
      return false;
    }
    
    if (!this.nuevoLugar.categoria?.trim()) {
      this.mostrarError('La categoría del lugar es obligatoria');
      return false;
    }

    if (this.nuevoLugar.nombre.trim().length < 2) {
      this.mostrarError('El nombre debe tener al menos 2 caracteres');
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

    if (this.lugarEditando.nombre.trim().length < 2) {
      this.mostrarError('El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    return true;
  }

  private limpiarFormulario() {
    this.nuevoLugar = {
      id_destino: this.nuevoLugar.id_destino, // Mantener el destino
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: '',
      totalResenas: 0,
      promedioRating: 0
    };
  }

  private async mostrarLoading(mensaje: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'crescent',
      duration: 15000
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
}