import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';


// ⬇️ importa y registra los íconos
import { addIcons } from 'ionicons';
import { musicalNotes, locationOutline, restaurantOutline } from 'ionicons/icons';


@Component({
 selector: 'app-home',
 standalone: true,
 imports: [CommonModule, IonicModule],
 templateUrl: './home.page.html',
 styleUrls: ['./home.page.scss'],
 encapsulation: ViewEncapsulation.None
})
export class HomePage {
 constructor(private router: Router) {
   // ⬇️ asegura que los íconos existan con esos nombres en el HTML
   addIcons({
     'musical-notes': musicalNotes,
     'location': locationOutline,
     'restaurant': restaurantOutline,
   });
 }


 goTo(tab: 'events' | 'places' | 'food') {
   switch (tab) {
     case 'events':  this.router.navigate(['/tabs', 'eventos']);  break;
     case 'places':  this.router.navigate(['/tabs', 'capture']);  break; // o la ruta de “Lugares” que uses
     case 'food':    this.router.navigate(['/tabs', 'gastronomia']); break;
   }
 }
}




