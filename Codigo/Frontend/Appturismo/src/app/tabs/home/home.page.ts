import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface Meal {
  type: string;
  icon: string;
  color: string;
  consumed: number;
  target: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  // Datos de ejemplo (luego vendrán de Supabase)
  totalConsumed = 1291;
  totalRemaining = 826;
  totalBurned = 244;
  dailyTarget = 2117; // meta diaria

  carbs = { consumed: 206, target: 258 };
  protein = { consumed: 35, target: 103 };
  fat = { consumed: 32, target: 68 };

  meals: Meal[] = [
    { type: 'Desayuno', icon: 'coffee', color: 'warning', consumed: 56, target: 635 },
    { type: 'Almuerzo', icon: 'dinner', color: 'success', consumed: 856, target: 847 },
    { type: 'Cena', icon: 'hamburger', color: 'tertiary', consumed: 379, target: 529 },
    { type: 'Snacks', icon: 'snack', color: 'danger', consumed: 0, target: 106 }
  ];

  // 🔹 Variables necesarias para el círculo de progreso
  radius = 70;
  circumference = 2 * Math.PI * this.radius;

  get progress(): number {
    return this.totalConsumed / this.dailyTarget;
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.progress);
  }

  addMeal(type: string) {
    console.log(`Agregar comida a: ${type}`);
  }
}
