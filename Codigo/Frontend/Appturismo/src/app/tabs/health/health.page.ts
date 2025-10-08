import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';

interface Resena {
  texto: string;
  fecha: string;
  usuario: string;
  avatar?: string;
  rating: number;
}

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HealthPage implements OnInit {
  lugarSeleccionado: string = 'Lugar no especificado';
  nuevaResenaTexto: string = '';
  nuevaResenaRating: number = 0;
  
  resenas: Resena[] = [
    { 
      texto: 'Hermoso lugar, muy limpio y bien mantenido. La arquitectura es impresionante y vale totalmente la pena visitarlo. Recomiendo ir temprano para evitar multitudes.', 
      fecha: '14/09/2025', 
      usuario: 'María González',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      rating: 5
    },
    { 
      texto: 'Muy interesante, pero algo lleno. La experiencia fue buena aunque había mucha gente. Los guías son muy conocedores y las explicaciones muy completas.', 
      fecha: '21/09/2025', 
      usuario: 'Carlos Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4
    },
    { 
      texto: 'Increíble experiencia cultural. La historia del lugar es fascinante y la preservación es excelente. Perfecto para visitar en familia.', 
      fecha: '05/10/2025', 
      usuario: 'Ana Martínez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5
    },
    { 
      texto: 'Buen lugar pero un poco caro. La entrada podría tener mejor precio considerando lo que ofrece. Aún así, recomiendo la visita.', 
      fecha: '08/10/2025', 
      usuario: 'Javier López',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 3
    }
  ];

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.lugarSeleccionado = params['lugar'] || 'Lugar no especificado';
      console.log('Lugar seleccionado:', this.lugarSeleccionado);
    });
  }

  /**
   * Agregar una nueva reseña
   */
  async agregarResena() {
    if (!this.nuevaResenaTexto.trim()) {
      await this.mostrarToast('Por favor, escribí tu reseña antes de publicar', 'warning');
      return;
    }

    const nuevaResena: Resena = {
      texto: this.nuevaResenaTexto.trim(),
      fecha: new Date().toLocaleDateString('es-AR'),
      usuario: 'Tú',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: this.nuevaResenaRating || 5
    };

    // Agregar la nueva reseña al inicio del array
    this.resenas.unshift(nuevaResena);
    
    // Limpiar formulario
    this.nuevaResenaTexto = '';
    this.nuevaResenaRating = 0;

    // Mostrar mensaje de éxito
    await this.mostrarToast('¡Reseña publicada con éxito!', 'success');

    // Scroll to top para ver la nueva reseña
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      if (content) {
        content.scrollToTop(500);
      }
    }, 300);
  }

  /**
   * Seleccionar rating para nueva reseña
   */
  seleccionarRating(rating: number) {
    this.nuevaResenaRating = rating;
  }

  /**
   * Calcular promedio de ratings
   */
  obtenerPromedioRating(): string {
    if (this.resenas.length === 0) return '0.0';
    
    const total = this.resenas.reduce((sum, resena) => sum + resena.rating, 0);
    const promedio = total / this.resenas.length;
    return promedio.toFixed(1);
  }

  /**
   * Calcular porcentaje de cada rating
   */
  calcularPorcentajeRating(rating: number): number {
    const count = this.resenas.filter(r => r.rating === rating).length;
    const total = this.resenas.length;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  /**
   * Mostrar toast de notificación
   */
  async mostrarToast(mensaje: string, tipo: string = 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: tipo === 'success' ? 'success' : 'warning',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Lifecycle hook - cuando la página entra
   */
  ionViewDidEnter() {
    console.log('Página de reseñas cargada para:', this.lugarSeleccionado);
  }

  /**
   * Lifecycle hook - cuando la página sale
   */
  ionViewWillLeave() {
    console.log('Saliendo de la página de reseñas');
  }

  /**
   * Navegar de vuelta a lugares
   */
  volverALugares() {
    this.navCtrl.navigateBack('/tabs/capture');
  }
}