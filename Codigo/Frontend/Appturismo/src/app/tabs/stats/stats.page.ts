import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonFab, IonFabButton,
  IonSelect, IonSelectOption, IonSearchbar, IonList, ToastController
} from '@ionic/angular/standalone';  // 👈 Asegurate de incluir IonList acá también
import { supabase } from '../../supabase';
import { addIcons } from 'ionicons';
import { add, create, trash, save, close, refresh, calendar } from 'ionicons/icons';


@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonFab, IonFabButton,
    IonSelect, IonSelectOption, IonSearchbar,
    IonList  // 👈 agregalo acá también
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
    fecha_de_inicio: '',
    fecha_fin: '',
    tipo_de_evento: ''
  };

  constructor() {
    addIcons({ add, create, trash, save, close, refresh, calendar });
  }

  async ngOnInit() {
    await this.cargarEventos();
  }

  async cargarEventos() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('id_eventos', { ascending: false });

    if (error) {
      this.mostrarToast('Error al cargar eventos', 'danger');
    } else {
      this.eventos = data || [];
      this.aplicarFiltro();
    }
  }

  aplicarFiltro() {
    const texto = this.terminoBusqueda.toLowerCase();
    this.eventosFiltrados = this.eventos.filter(ev =>
      ev.nombre.toLowerCase().includes(texto)
    );
  }

  onBuscarChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltro();
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.eventoEditando = null;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.eventoEditando = null;
    this.nuevoEvento = {
      id_destino: 1,
      nombre: '',
      descripcion: '',
      fecha_de_inicio: '',
      fecha_fin: '',
      tipo_de_evento: ''
    };
  }

  async crearEvento() {
    const { error } = await supabase.from('eventos').insert([this.nuevoEvento]);
    if (error) this.mostrarToast('Error al crear evento', 'danger');
    else {
      this.mostrarToast('Evento creado correctamente', 'success');
      this.cerrarFormulario();
      await this.cargarEventos();
    }
  }

  editarEvento(ev: any) {
    this.eventoEditando = { ...ev };
    this.mostrarFormulario = true;
  }

  async guardarEdicion() {
    const { error } = await supabase
      .from('eventos')
      .update(this.eventoEditando)
      .eq('id_eventos', this.eventoEditando.id_eventos);
    if (error) this.mostrarToast('Error al actualizar evento', 'danger');
    else {
      this.mostrarToast('Evento actualizado', 'success');
      this.cerrarFormulario();
      await this.cargarEventos();
    }
  }

  async eliminarEvento(id: number) {
    const { error } = await supabase.from('eventos').delete().eq('id_eventos', id);
    if (error) this.mostrarToast('Error al eliminar evento', 'danger');
    else {
      this.mostrarToast('Evento eliminado', 'success');
      await this.cargarEventos();
    }
  }

  getIcon(tipo: string): string {
    if (!tipo) return 'calendar';
    const t = tipo.toLowerCase();
    if (t.includes('música')) return 'musical-notes-outline';
    if (t.includes('feria')) return 'storefront-outline';
    if (t.includes('gastron')) return 'restaurant-outline';
    if (t.includes('deport')) return 'walk-outline';
    return 'calendar';
  }

  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toast.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}






