import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon]
})
export class PerfilPage {
  usuario = {
    nombre: 'Usuario Temporal',
    email: 'temp@example.com',
    foto: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  };

  editarPerfil() {
    console.log('Editar perfil');
    
  }

  verResenas() {
    console.log('Ver reseñas');
  }

  cerrarSesion() {
    console.log('Cerrando sesión...');
    // Más adelante podés conectar esto con Supabase
  }
}
