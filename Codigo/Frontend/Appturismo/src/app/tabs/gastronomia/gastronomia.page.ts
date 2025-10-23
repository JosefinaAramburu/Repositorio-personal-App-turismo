import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
 IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon,
 IonModal, IonHeader, IonToolbar, IonTitle, IonTextarea, IonInput, IonSelect,
 IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption,
 IonRefresher, IonRefresherContent, IonSpinner, IonButtons
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';


import { supabase } from '../../supabase';
import { addIcons } from 'ionicons';
import {
 restaurantOutline, beerOutline, nutritionOutline,
 iceCreamOutline, chevronForwardOutline, chatbubbleEllipsesOutline
} from 'ionicons/icons';


type RestauranteVM = {
 id_gastronomia: number;              // ⚠️ Si tu PK real es id_restaurantes, cambiala acá y en las consultas.
 id_destino?: number | null;
 nombre: string;
 categoria?: string | null;
 descripcion?: string | null;
 horario?: string | null;
 promedio?: number | null;
 cantidad?: number | null;
};


@Component({
 selector: 'app-gastronomia',
 standalone: true,
 templateUrl: './gastronomia.page.html',
 styleUrls: ['./gastronomia.page.scss'],
 imports: [
   CommonModule, FormsModule,
   IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon,
   IonModal, IonHeader, IonToolbar, IonTitle, IonTextarea, IonInput, IonSelect,
   IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption,
   IonRefresher, IonRefresherContent, IonSpinner, IonButtons
 ]
})
export class GastronomiaPage {
 // Filtros/búsqueda
 q = '';
 categoria: string | null = null;


 // Estados UI
 loading = false;
 saving = false;
 showForm = false;
 editing = false;


 // Datos
 items: RestauranteVM[] = [];
 filtered: RestauranteVM[] = [];


 // Form restaurante
 form = {
   nombre: '',
   categoria: 'restaurante',
   descripcion: '',
   horario: '',
   id_destino: null as number | null
 };


 // Edición
 currentItem: RestauranteVM | null = null;


 constructor(private router: Router) {
   addIcons({
     'restaurant-outline': restaurantOutline,
     'beer-outline': beerOutline,
     'nutrition-outline': nutritionOutline,
     'ice-cream-outline': iceCreamOutline,
     'chevron-forward-outline': chevronForwardOutline,
     'chatbubble-ellipses-outline': chatbubbleEllipsesOutline
   });
 }


 async ionViewWillEnter() {
   await this.load();
 }


 // ============ Cargar restaurantes ============
 async load(evt?: CustomEvent) {
   this.loading = true;
   try {
     let { data, error } = await supabase
       .from('restaurantes')
       .select('id_gastronomia, id_destino, nombre, categoria, descripcion, horario') // ⚠️ cambia a id_restaurantes si aplica
       .order('id_gastronomia', { ascending: false });


     if (error) {
       // fallback sin order por si el proyecto no permite order en esa columna
       const retry = await supabase
         .from('restaurantes')
         .select('id_gastronomia, id_destino, nombre, categoria, descripcion, horario');
       if (retry.error) throw retry.error;
       data = retry.data || [];
     }


     this.items = (data || []).map((r: any) => ({
       ...r,
       promedio: 0,
       cantidad: 0,
     })) as RestauranteVM[];


     this.filtered = [...this.items];
   } catch (e) {
     console.error('Error al cargar restaurantes:', e);
     alert('No se pudieron cargar los restaurantes.');
   } finally {
     this.loading = false;
     (evt as any)?.target?.complete?.();
   }
 }


 // ============ Filtros ============
 applyFilters() {
   const q = (this.q || '').trim().toLowerCase();
   const wantedCat = (this.categoria || '').trim().toLowerCase();


   this.filtered = this.items.filter(r => {
     const nombre = (r.nombre || '').toLowerCase();
     const cat    = (r.categoria || '').toLowerCase();
     const desc   = (r.descripcion || '').toLowerCase();
     const passText = !q || nombre.includes(q) || cat.includes(q) || desc.includes(q);
     const passCat  = !wantedCat || cat === wantedCat;
     return passText && passCat;
   });
 }


 goToCategoria(cat: string) {
   this.categoria = cat;
   this.applyFilters();
 }


 clearFilters() {
   this.q = '';
   this.categoria = null;
   this.filtered = [...this.items];
 }


 // ============ CRUD restaurante ============
 openForm(r?: RestauranteVM) {
   this.showForm = true;
   this.editing = !!r;
   this.form = r
     ? {
         nombre: r.nombre,
         categoria: r.categoria || 'restaurante',
         descripcion: r.descripcion || '',
         horario: r.horario || '',
         id_destino: (r.id_destino ?? null)
       }
     : { nombre: '', categoria: 'restaurante', descripcion: '', horario: '', id_destino: null };


   this.currentItem = r || null;
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
     const payload = {
       nombre: this.form.nombre.trim(),
       categoria: this.form.categoria,
       descripcion: this.form.descripcion || null,
       horario: this.form.horario || null,
       id_destino: this.form.id_destino,
     };


     if (this.editing && this.currentItem) {
       await supabase
         .from('restaurantes')
         .update(payload)
         .eq('id_gastronomia', this.currentItem.id_gastronomia); // ⚠️ cambia a id_restaurantes si aplica
     } else {
       await supabase.from('restaurantes').insert(payload);
     }


     await this.load();
     this.closeForm();
   } catch (e) {
     console.error('Error guardando restaurante:', e);
     alert('No se pudo guardar.');
   } finally {
     this.saving = false;
   }
 }


 async confirmDelete(r: RestauranteVM) {
   const ok = confirm(`¿Eliminar "${r.nombre}"?`);
   if (!ok) return;
   try {
     await supabase
       .from('restaurantes')
       .delete()
       .eq('id_gastronomia', r.id_gastronomia); // ⚠️ cambia a id_restaurantes si aplica
     await this.load();
   } catch (e) {
     console.error('Error eliminando restaurante:', e);
     alert('No se pudo eliminar.');
   }
 }


 // ============ Navegar al TAB de Reseñas (HEALTH) ============
 goToHealth(r: RestauranteVM) {
   this.router.navigate(['/tabs/health'], {
     queryParams: {
       from: 'gastronomia',
       tipo: 'restaurante',   // Health usará esto para decidir la tabla puente
       id: r.id_gastronomia,  // ⚠️ si tu PK real es id_restaurantes, mandá ese campo
       nombre: r.nombre
     }
   });
 }
}


