import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
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
export class CapturePage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // ✅ Verificar si ya está logueado al cargar la página
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

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
        // ✅ Guardar estado de login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', this.email);
        
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