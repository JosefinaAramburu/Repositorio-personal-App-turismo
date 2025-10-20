import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonList, IonTextarea, IonIcon, IonBadge,
  IonFab, IonFabButton, IonSelect, IonSelectOption, IonLoading,
  IonChip, IonSearchbar,
  AlertController, LoadingController, ToastController, NavController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  add, create, location, map, save, checkmark, close,
  time, trash, refresh, chatbubble, star, filter, search
} from 'ionicons/icons';

import { supabase } from '../../supabase';

// Interfaces simples
export interface Lugar {
  id_lugares?: number;
  id_destino: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  totalResenas: number;
  promedioRating: number;
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonList, IonTextarea, IonIcon, IonBadge,
    IonFab, IonFabButton, IonSelect, IonSelectOption, IonLoading,
    IonChip, IonSearchbar
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
    { valor: 'Otro', label: 'Otros' }
  ];

  constructor() {
    addIcons({
      add, create, location, map, save, checkmark, close,
      time, trash, refresh, chatbubble, star, filter, search
    });
  }

  async ngOnInit() {
    await this.cargarLugares();
  }

  // 🔄 CARGAR DATOS
  async cargarLugares() {
    this.isLoading = true;
    
    try {
      // Obtener lugares de Supabase
      const { data, error } = await supabase
        .from('lugares')
        .select('*')
        .order('id_lugares', { ascending: false });

      if (error) throw error;

      // Calcular reseñas para cada lugar
      this.lugares = await Promise.all(
        (data || []).map(async (lugar) => {
          const stats = await this.calcularEstadisticas(lugar.id_lugares!);
          return { ...lugar, ...stats };
        })
      );

      this.aplicarFiltros();
      
    } catch (error: any) {
      this.mostrarError('Error al cargar lugares: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // 📊 CALCULAR ESTADÍSTICAS DE RESEÑAS
  async calcularEstadisticas(idLugar: number): Promise<{totalResenas: number, promedioRating: number}> {
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
      
      // Obtener las reseñas
      const { data: resenas } = await supabase
        .from('resenas')
        .select('puntuacion')
        .in('id_resenas', idsResenas);

      if (!resenas) return { totalResenas: 0, promedioRating: 0 };

      const totalResenas = resenas.length;
      const sumaRatings = resenas.reduce((sum, resena) => sum + (resena.puntuacion || 0), 0);
      const promedioRating = totalResenas > 0 ? Number((sumaRatings / totalResenas).toFixed(1)) : 0;

      return { totalResenas, promedioRating };
    } catch (error) {
      return { totalResenas: 0, promedioRating: 0 };
    }
  }

  // 🔍 FILTRAR Y BUSCAR
  aplicarFiltros() {
    let resultados = [...this.lugares];

    // Filtrar por búsqueda
    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase();
      resultados = resultados.filter(lugar =>
        lugar.nombre.toLowerCase().includes(busqueda) ||
        (lugar.descripcion && lugar.descripcion.toLowerCase().includes(busqueda))
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

  // ➕ CREAR LUGAR
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
      this.mostrarError('Error al crear lugar: ' + error.message);
    }
  }

  // ✏️ EDITAR LUGAR
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
      this.mostrarError('Error al actualizar lugar: ' + error.message);
    }
  }

  cancelarEdicion() {
    this.lugarEditando = null;
    this.mostrarFormulario = false;
    this.limpiarFormulario();
  }

  // 🗑️ ELIMINAR LUGAR
  async eliminarLugar(id: number) {
    const alert = await this.alertController.create({
      header: '¿Eliminar lugar?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              const loading = await this.mostrarLoading('Eliminando lugar...');
              
              // Primero eliminar relaciones de reseñas
              await supabase.from('lugares_resenas').delete().eq('id_lugares', id);
              
              // Luego eliminar el lugar
              const { error } = await supabase.from('lugares').delete().eq('id_lugares', id);
              if (error) throw error;

              await loading.dismiss();
              await this.cargarLugares();
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

  // 👁️ VER RESEÑAS
  verResenas(lugar: Lugar) {
    if (!lugar.id_lugares) return;
    
    this.navCtrl.navigateForward('/tabs/health', {
      queryParams: {
        id: lugar.id_lugares,
        lugar: lugar.nombre,
        categoria: lugar.categoria
      }
    });
  }

  // 🎨 MÉTODOS DE UI
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.lugarEditando = null;
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

  // 🎯 MÉTODOS DE AYUDA
  getCategoriaColor(categoria: string): string {
    const colores: { [key: string]: string } = {
      'Monumento': 'warning',
      'Museo': 'tertiary', 
      'Parque': 'success',
      'Playa': 'info',
      'Mirador': 'primary',
      'Histórico': 'medium',
      'Shopping': 'pink',
      'Otro': 'dark'
    };
    return colores[categoria] || 'medium';
  }

  trackByLugar(index: number, lugar: Lugar): number {
    return lugar.id_lugares!;
  }

  // 💬 MENSAJES AL USUARIO
  private async mostrarLoading(mensaje: string) {
    const loading = await this.loadingController.create({ message: mensaje });
    await loading.present();
    return loading;
  }

  private async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'top'
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