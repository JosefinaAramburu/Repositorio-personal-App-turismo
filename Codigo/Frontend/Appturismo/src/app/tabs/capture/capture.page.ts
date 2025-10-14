import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // ✅ NECESARIO para ngModel

// ✅ IMPORTAR todos los componentes de Ionic que usas
import { IonContent } from '@ionic/angular/standalone';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { IonItem } from '@ionic/angular/standalone';
import { IonLabel } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true, // ✅ AGREGAR esto
  imports: [ // ✅ AGREGAR todos los imports necesarios
    FormsModule, // Para ngModel
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ]
})
export class CapturePage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      duration: 1500,
    });
    await loading.present();

    // Simulación de autenticación
    setTimeout(() => {
      loading.dismiss();
      if (this.email === 'usuario@test.com' && this.password === '1234') {
        this.router.navigate(['/home']);
      } else {
        this.showAlert('Credenciales inválidas', 'El correo o la contraseña son incorrectos.');
      }
    }, 1500);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}