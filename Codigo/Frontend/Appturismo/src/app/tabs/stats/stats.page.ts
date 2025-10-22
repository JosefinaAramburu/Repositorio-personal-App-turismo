import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Este es crucial
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonFab, IonFabButton,
  IonSelect, IonSelectOption, IonSearchbar, IonList, ToastController,
  IonDatetime 
} from '@ionic/angular/standalone';

import { supabase } from '../../supabase';
import { addIcons } from 'ionicons';
import { add, create, trash, save, close, refresh, calendar, musicalNotes, storefront, restaurant, walk } from 'ionicons/icons';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // 👈 Esto resuelve el error NG01203
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonFab, IonFabButton,
    IonSelect, IonSelectOption, IonSearchbar, IonList,
    IonDatetime 
  ]
})
export class StatsPage implements OnInit {
  private toast = inject(ToastController);

  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  mostrarFormulario = false;
  terminoBusqueda = '';
  eventoEditando: any = null;

  nuevoEvento = {
    id_destino: 1,
    nombre: '',
    descripcion: '',
    fecha_de_inicio: '', // Formato: YYYY-MM-DD
    fecha_fin: '', // Formato: YYYY-MM-DD
    tipo_de_evento: ''
  };

  constructor() {
    addIcons({ 
      add, create, trash, save, close, refresh, calendar, 
      musicalNotes, storefront, restaurant, walk 
    });
  }

  async ngOnInit() {
    await this.cargarEventos();
  }

  async cargarEventos() {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_de_inicio', { ascending: true });

      if (error) {
        console.error('Error cargando eventos:', error);
        this.mostrarToast('Error al cargar eventos', 'danger');
      } else {
        this.eventos = data || [];
        this.aplicarFiltro();
      }
    } catch (err) {
      console.error('Excepción al cargar eventos:', err);
      this.mostrarToast('Error inesperado', 'danger');
    }
  }

  aplicarFiltro() {
    const texto = this.terminoBusqueda.toLowerCase();
    this.eventosFiltrados = this.eventos.filter(ev =>
      ev.nombre.toLowerCase().includes(texto) ||
      ev.tipo_de_evento.toLowerCase().includes(texto)
    );
  }

  onBuscarChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltro();
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.eventoEditando = null;
    // Resetear el formulario
    this.nuevoEvento = {
      id_destino: 1,
      nombre: '',
      descripcion: '',
      fecha_de_inicio: '',
      fecha_fin: '',
      tipo_de_evento: ''
    };
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.eventoEditando = null;
  }

  async crearEvento() {
    console.log('Datos del evento:', this.nuevoEvento);

    // Validaciones
    if (!this.nuevoEvento.nombre?.trim()) {
      this.mostrarToast('El nombre del evento es requerido', 'warning');
      return;
    }

    if (!this.nuevoEvento.tipo_de_evento) {
      this.mostrarToast('Selecciona un tipo de evento', 'warning');
      return;
    }

    if (!this.nuevoEvento.fecha_de_inicio) {
      this.mostrarToast('La fecha de inicio es requerida', 'warning');
      return;
    }

    try {
      // Formatear fechas correctamente para Supabase
      const eventoParaInsertar = {
        id_destino: 1,
        nombre: this.nuevoEvento.nombre.trim(),
        descripcion: this.nuevoEvento.descripcion?.trim() || null,
        tipo_de_evento: this.nuevoEvento.tipo_de_evento,
        fecha_de_inicio: this.formatearFechaParaSupabase(this.nuevoEvento.fecha_de_inicio),
        fecha_fin: this.nuevoEvento.fecha_fin ? 
          this.formatearFechaParaSupabase(this.nuevoEvento.fecha_fin) : 
          this.formatearFechaParaSupabase(this.nuevoEvento.fecha_de_inicio)
      };

      console.log('Insertando evento:', eventoParaInsertar);

      const { data, error } = await supabase
        .from('eventos')
        .insert([eventoParaInsertar])
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        this.mostrarToast(`Error: ${error.message}`, 'danger');
      } else {
        console.log('Evento creado exitosamente:', data);
        this.mostrarToast('Evento creado correctamente', 'success');
        this.cerrarFormulario();
        await this.cargarEventos();
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      this.mostrarToast('Error inesperado al crear evento', 'danger');
    }
  }

  // Función para formatear fechas correctamente
  private formatearFechaParaSupabase(fecha: any): string {
    if (!fecha) return '';
    
    if (typeof fecha === 'string') {
      // Si ya es string, verificar formato
      return fecha.split('T')[0]; // Tomar solo la parte de la fecha
    }
    
    // Si es objeto de ion-datetime
    if (fecha && typeof fecha === 'object') {
      // ion-datetime devuelve un objeto con year, month, day, etc.
      if (fecha.year) {
        return `${fecha.year}-${String(fecha.month).padStart(2, '0')}-${String(fecha.day).padStart(2, '0')}`;
      }
    }
    
    return fecha;
  }

  editarEvento(ev: any) {
    this.eventoEditando = { ...ev };
    this.mostrarFormulario = true;
  }

  async guardarEdicion() {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          nombre: this.eventoEditando.nombre,
          descripcion: this.eventoEditando.descripcion,
          tipo_de_evento: this.eventoEditando.tipo_de_evento,
          fecha_de_inicio: this.formatearFechaParaSupabase(this.eventoEditando.fecha_de_inicio),
          fecha_fin: this.formatearFechaParaSupabase(this.eventoEditando.fecha_fin)
        })
        .eq('id_eventos', this.eventoEditando.id_eventos);

      if (error) {
        console.error('Error actualizando:', error);
        this.mostrarToast(`Error al actualizar: ${error.message}`, 'danger');
      } else {
        this.mostrarToast('Evento actualizado', 'success');
        this.cerrarFormulario();
        await this.cargarEventos();
      }
    } catch (err) {
      console.error('Error inesperado al editar:', err);
      this.mostrarToast('Error inesperado', 'danger');
    }
  }

  async eliminarEvento(id: number) {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id_eventos', id);

      if (error) {
        console.error('Error eliminando:', error);
        this.mostrarToast('Error al eliminar evento', 'danger');
      } else {
        this.mostrarToast('Evento eliminado', 'success');
        await this.cargarEventos();
      }
    } catch (err) {
      console.error('Error inesperado al eliminar:', err);
      this.mostrarToast('Error inesperado', 'danger');
    }
  }

  getIcon(tipo: string): string {
    if (!tipo) return 'calendar';
    const t = tipo.toLowerCase();
    if (t.includes('música')) return 'musical-notes';
    if (t.includes('feria')) return 'storefront';
    if (t.includes('gastron')) return 'restaurant';
    if (t.includes('deport')) return 'walk';
    return 'calendar';
  }

  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toast.create({ 
      message: msg, 
      duration: 3000, 
      color,
      position: 'top'
    });
    await toast.present();
  }
}