// src/app/tabs/profile/profile.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// Ionic standalone imports
import {
 IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon,
 IonModal, IonHeader, IonToolbar, IonTitle, IonTextarea, IonInput, IonSelect,
 IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption,
 IonRefresher, IonRefresherContent, IonSpinner, IonSegment, IonSegmentButton,
 IonButtons
} from '@ionic/angular/standalone';


import { supabase } from '../../supabase';


// >>>>> Ionicons: registrar íconos que usas en el HTML
import { addIcons } from 'ionicons';
import {
 restaurantOutline,
 beerOutline,
 nutritionOutline,
 iceCreamOutline,
 chevronForwardOutline,
 star,
 starOutline
} from 'ionicons/icons';


type RestauranteVM = {
 id: number;               // viene de la vista v_restaurantes_rating
 nombre: string;
 categoria: string | null;
 descripcion: string | null;
 horario: string | null;
 promedio: number;         // calculado en la vista
 cantidad: number;         // calculado en la vista
};


type ResenaVM = {
 id_resena: number;
 id_usuario: number | null;
 texto: string | null;
 puntuacion: number;
 fecha: string;            // ISO date
};


@Component({
 selector: 'app-profile',
 standalone: true,
 templateUrl: './profile.page.html',
 styleUrls: ['./profile.page.scss'],
 imports: [
   CommonModule, FormsModule,
   IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon,
   IonModal, IonHeader, IonToolbar, IonTitle, IonTextarea, IonInput, IonSelect,
   IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption,
   IonRefresher, IonRefresherContent, IonSpinner, IonSegment, IonSegmentButton,
   IonButtons
 ]
})
export class ProfilePage {
 // Filtros / búsqueda
 q = '';
 categoria: string | null = null;


 // Estados UI
 loading = false;
 saving = false;
 showForm = false;
 editing = false;


 // Lista y filtro
 items: RestauranteVM[] = [];
 filtered: RestauranteVM[] = [];


 // Form restaurante
 form = {
   nombre: '',
   categoria: 'restaurante',
   descripcion: '',
   horario: ''
 } as { nombre: string; categoria: string; descripcion: string; horario: string; };


 // Reseñas (modal)
 showReviews = false;
 currentItem: RestauranteVM | null = null;
 reviewsForCurrent: ResenaVM[] = [];
 newReview = { puntuacion: 5, texto: '' };
 savingReview = false;


 constructor() {
   // Registrar íconos para que <ion-icon name="..."> funcione
   addIcons({
     'restaurant-outline': restaurantOutline,
     'beer-outline': beerOutline,
     'nutrition-outline': nutritionOutline,
     'ice-cream-outline': iceCreamOutline,
     'chevron-forward-outline': chevronForwardOutline,
     'star': star,
     'star-outline': starOutline,
   });
 }


 // Lifecycle
 async ionViewWillEnter() {
   await this.load();
 }


 // Cargar lista principal (desde la vista v_restaurantes_rating)
 async load(evt?: CustomEvent) {
   this.loading = true;
   try {
     const { data, error } = await supabase
       .from('v_restaurantes_rating')
       .select('*')
       .order('promedio', { ascending: false });


     if (error) throw error;
     this.items = (data || []) as RestauranteVM[];
     this.applyFilters();
   } catch (e) {
     console.error('Error al cargar restaurantes:', e);
   } finally {
     this.loading = false;
     if (evt && (evt.target as any)?.complete) {
       (evt.target as any).complete();
     }
   }
 }


 // Filtros
 applyFilters() {
   const q = this.q.trim().toLowerCase();
   this.filtered = this.items.filter(r => {
     const passText = !q || r.nombre.toLowerCase().includes(q) ||
       (r.categoria || '').toLowerCase().includes(q) ||
       (r.descripcion || '').toLowerCase().includes(q);
     const passCat = !this.categoria || (r.categoria || '') === this.categoria;
     return passText && passCat;
   });
 }


 goToCategoria(cat: string) {
   this.categoria = cat;
   this.applyFilters();
 }


 // -------- CRUD Restaurante --------
 openForm(r?: RestauranteVM) {
   this.showForm = true;
   this.editing = !!r;


   if (r) {
     this.form = {
       nombre: r.nombre || '',
       categoria: (r.categoria || 'restaurante'),
       descripcion: (r.descripcion || ''),
       horario: (r.horario || '')
     };
     this.currentItem = r;
   } else {
     this.form = { nombre: '', categoria: 'restaurante', descripcion: '', horario: '' };
     this.currentItem = null;
   }
 }


 closeForm() {
   this.showForm = false;
   this.editing = false;
   this.currentItem = null;
 }


 async save() {
   if (!this.form.nombre?.trim()) return;
   this.saving = true;
   try {
     if (this.editing && this.currentItem) {
       const { error } = await supabase
         .from('restaurantes')
         .update({
           nombre: this.form.nombre.trim(),
           categoria: this.form.categoria,
           descripcion: this.form.descripcion || null,
           horario: this.form.horario || null
         })
         .eq('id_restaurantes', this.currentItem.id);
       if (error) throw error;
     } else {
       const { error } = await supabase
         .from('restaurantes')
         .insert({
           nombre: this.form.nombre.trim(),
           categoria: this.form.categoria,
           descripcion: this.form.descripcion || null,
           horario: this.form.horario || null
         });
       if (error) throw error;
     }
     await this.load();
     this.closeForm();
   } catch (e) {
     console.error('Error guardando restaurante:', e);
   } finally {
     this.saving = false;
   }
 }


 async confirmDelete(r: RestauranteVM) {
   const ok = confirm(`¿Eliminar "${r.nombre}"? Esta acción no se puede deshacer.`);
   if (!ok) return;
   try {
     const { error } = await supabase
       .from('restaurantes')
       .delete()
       .eq('id_restaurantes', r.id);
     if (error) throw error;
     await this.load();
   } catch (e) {
     console.error('Error eliminando restaurante:', e);
   }
 }


 // -------- Reseñas --------
 async openReviews(r: RestauranteVM) {
   this.currentItem = r;
   this.newReview = { puntuacion: 5, texto: '' };
   await this.loadReviews(r.id);
   this.showReviews = true;
 }


 closeReviews() {
   this.showReviews = false;
   this.currentItem = null;
   this.reviewsForCurrent = [];
   this.newReview = { puntuacion: 5, texto: '' };
 }


 private async loadReviews(idRestaurante: number) {
   try {
     const { data, error } = await supabase
       .from('v_resenas_por_restaurantes')
       .select('*')
       .eq('id_restaurantes', idRestaurante)
       .order('fecha', { ascending: false });
     if (error) throw error;
     this.reviewsForCurrent = (data || []).map((r: any) => ({
       id_resena: r.id_reseñas,
       id_usuario: r.id_usuario,
       texto: r.texto,
       puntuacion: r.puntuacion,
       fecha: r.fecha
     })) as ResenaVM[];
   } catch (e) {
     console.error('Error obteniendo reseñas:', e);
     this.reviewsForCurrent = [];
   }
 }


 async enviarResena() {
   if (!this.currentItem) return;
   const punt = +this.newReview.puntuacion;
   const text = (this.newReview.texto || '').trim();
   if (!punt || punt < 1 || punt > 5) return;
   if (!text) return;


   this.savingReview = true;
   try {
     const { data: nueva, error: e1 } = await supabase
       .from('reseñas')
       .insert({
         texto: text,
         puntuacion: punt,
         id_usuario: null
       })
       .select('id_reseñas')
       .single();
     if (e1) throw e1;
     const idResena = (nueva as any).id_reseñas as number;


     const { error: e2 } = await supabase
       .from('restaurantes_reseñas')
       .insert({
         id_restaurantes: this.currentItem.id,
         id_reseñas: idResena
       });
     if (e2) throw e2;


     await this.loadReviews(this.currentItem.id);
     await this.load();
     this.newReview = { puntuacion: 5, texto: '' };
   } catch (e) {
     console.error('Error enviando reseña:', e);
   } finally {
     this.savingReview = false;
   }
 }


 // ==== Helpers estrellas ====
 getStars(count: number): number[] {
   return Array(count).fill(0).map((_, i) => i);
 }
 getEmptyStars(count: number): number[] {
   return Array(5 - count).fill(0).map((_, i) => i);
 }
}


