import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Lugar {
  nombre: string;
  categoria: string;
  descripcion: string;
  horario: string;
  direccion?: string;
  coordenadas?: string;
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CapturePage {
  lugares: Lugar[] = [
    {
      nombre: 'Museo Nacional de Bellas Artes',
      categoria: 'Museo',
      descripcion: 'Uno de los museos más importantes del país, con colecciones de arte argentino e internacional.',
      horario: 'Martes a domingo de 11 a 19 h',
      direccion: 'Av. del Libertador 1473, CABA',
      coordenadas: '-34.583, -58.392',
    },
    {
      nombre: 'Plaza Francia',
      categoria: 'Plaza',
      descripcion: 'Espacio verde ideal para descansar y disfrutar de ferias artesanales.',
      horario: 'Abierta las 24 horas',
      direccion: 'Recoleta, CABA',
      coordenadas: '-34.587, -58.393',
    },
    {
      nombre: 'Obelisco',
      categoria: 'Monumento',
      descripcion: 'Símbolo icónico de Buenos Aires ubicado en la intersección de Av. 9 de Julio y Corrientes.',
      horario: 'Visible las 24 horas',
      direccion: 'Av. 9 de Julio, CABA',
      coordenadas: '-34.603, -58.381',
    },
  ];
}
