import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonList, IonIcon,
  IonRange, IonFab, IonFabButton, IonLoading, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, close, star, starOutline, save, chatbubble, trash, refresh } from 'ionicons/icons';
import { supabase } from '../../supabase';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonList, IonIcon,
    IonRange, IonFab, IonFabButton, IonLoading
  ]
})
export class HealthPage implements OnInit {
  resenas: any[] = [];
  cargando = false;
  mostrarFormulario = false;
  idLugar!: number;

  nuevaResena = { titulo: '', contenido: '', calificacion: 5 };

  private toastController = inject(ToastController);

  constructor(private route: ActivatedRoute) {
    addIcons({ add, close, star, starOutline, save, chatbubble, trash, refresh });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.idLugar = Number(params['id']);
      await this.cargarResenas();
    });
  }

  async cargarResenas() {
    this.cargando = true;
    try {
      const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      this.resenas = data || [];
    } catch (err) {
      this.mostrarToast('Error al cargar reseñas', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async probarAgregarResena() {
    if (!this.nuevaResena.titulo || !this.nuevaResena.contenido) {
      this.mostrarToast('Completa todos los campos', 'warning');
      return;
    }
    this.cargando = true;
    await this.agregarResena();
  }

  async agregarResena() {
    try {
      const datos = {
        texto: `${this.nuevaResena.titulo}: ${this.nuevaResena.contenido}`,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0],
        id_usuario: 1
      };
      const { error } = await supabase.from('resenas').insert([datos]);
      if (error) throw error;
      this.mostrarToast('Reseña agregada correctamente', 'success');
      await this.cargarResenas();
      this.nuevaResena = { titulo: '', contenido: '', calificacion: 5 };
      this.mostrarFormulario = false;
    } catch (err) {
      this.mostrarToast('Error al agregar reseña', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async eliminarResena(id: number) {
    try {
      await supabase.from('resenas').delete().eq('id_resenas', id);
      this.mostrarToast('Reseña eliminada', 'success');
      await this.cargarResenas();
    } catch {
      this.mostrarToast('Error al eliminar reseña', 'danger');
    }
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
