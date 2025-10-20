import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar]
})
export class PerfilPage {
  usuario = {
    nombre: 'Usuario Temporal',
    email: 'temp@example.com',
    foto: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  };
}
