import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { DatabaseService } from '../services/database';
import { IonicModule, IonIcon } from '@ionic/angular';




@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
imports: [CommonModule, FormsModule, IonicModule]
}
)
export class StatsPage implements OnInit {


  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  filtro = '';


  constructor(private db: DatabaseService) {}


  async ngOnInit() {
    await this.cargarEventos();
  }


  async cargarEventos() {
    try {
      const { data, error } = await (window as any).supabase
        .from('eventos')
        .select('*, destino(*)')
        .order('fecha_de_inicio', { ascending: true });
      if (error) throw error;
      this.eventos = data || [];
      this.eventosFiltrados = [...this.eventos];
    } catch (err) {
      console.error('Error cargando eventos:', err);
    }
  }


  aplicarFiltro() {
    const q = (this.filtro || '').toLowerCase();
    this.eventosFiltrados = this.eventos.filter(e =>
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.tipo_de_evento || '').toLowerCase().includes(q) ||
      (e.destino?.nombre_ciudad || '').toLowerCase().includes(q)
    );
  }


  formatFecha(fecha: string) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  }


  getIcon(tipo: string) {
    if (!tipo) return 'calendar';
    const t = tipo.toLowerCase();
    if (t.includes('música') || t.includes('musica')) return 'musical-notes';
    if (t.includes('feria') || t.includes('libro')) return 'book';
    if (t.includes('cerveza') || t.includes('fiesta')) return 'beer';
    return 'calendar';
  }


  getIconColor(tipo: string) {
    if (!tipo) return '#444';
    const t = tipo.toLowerCase();
    if (t.includes('música') || t.includes('musica')) return '#ff6b6b';
    if (t.includes('feria') || t.includes('libro')) return '#6b6bff';
    if (t.includes('cerveza') || t.includes('fiesta')) return '#3ddc84';
    return '#444';
  }
}

