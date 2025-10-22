import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
 IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
 IonRefresher, IonRefresherContent, IonAvatar, IonList, IonItem, IonInput,
 IonLabel, IonTextarea, IonToggle, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';


// (Opcional) Supabase — si no lo tenés, podés quitar estas 2 líneas y todo seguirá guardándose en localStorage
import { supabase } from '../../supabase';
import { addIcons } from 'ionicons';
import {
 cameraOutline, informationCircleOutline
} from 'ionicons/icons';


type Perfil = {
 id_local: string;          // ID local (localStorage)
 nombre: string;
 email: string;
 pais: string;
 ciudad: string;
 bio: string;
 avatar_url: string | null; // URL remota (Supabase) si existe
 avatar_preview?: string | null; // DataURL temporal para preview
 notificaciones: boolean;
 compacto: boolean;
};


@Component({
 selector: 'app-perfil',
 standalone: true,
 templateUrl: './perfil.page.html',
 styleUrls: ['./perfil.page.scss'],
 imports: [
   CommonModule, FormsModule,
   IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
   IonRefresher, IonRefresherContent, IonAvatar, IonList, IonItem, IonInput,
   IonLabel, IonTextarea, IonToggle, IonNote, IonSpinner
 ]
})
export class PerfilPage {
 defaultAvatar = 'https://i.pravatar.cc/200';
 saving = false;
 lastSaved: Date | null = null;


 // Estado del formulario
 form: Perfil = {
   id_local: '',
   nombre: '',
   email: '',
   pais: '',
   ciudad: '',
   bio: '',
   avatar_url: null,
   avatar_preview: null,
   notificaciones: true,
   compacto: false,
 };


 constructor() {
   addIcons({
     'camera-outline': cameraOutline,
     'information-circle-outline': informationCircleOutline,
   });


   this.ensureLocalId();
   this.loadFromLocal();
   // Intentá cargar también desde Supabase (si existe la tabla)
   this.loadFromSupabase().catch(() => {});
 }


 // ======================
 //   Helpers de estado
 // ======================
 private ensureLocalId() {
   const key = 'perfil_local_id';
   let id = localStorage.getItem(key);
   if (!id) {
     id = crypto?.randomUUID?.() || String(Date.now());
     localStorage.setItem(key, id);
   }
   this.form.id_local = id;
 }


 private loadFromLocal() {
   const raw = localStorage.getItem('perfil_data');
   if (!raw) return;
   try {
     const parsed = JSON.parse(raw);
     this.form = { ...this.form, ...parsed };
   } catch {}
 }


 private saveToLocal() {
   const toSave = { ...this.form };
   localStorage.setItem('perfil_data', JSON.stringify(toSave));
 }


 // ======================
 //   Carga remota (opt)
 // ======================
 /**
  * Si tenés en Supabase:
  *  - Tabla: usuario
  *  - Columnas sugeridas: id_usuario (text/varchar PK), nombre, email, pais, ciudad, bio, avatar_url, notificaciones (bool), compacto (bool), updated_at (timestamptz)
  */
 private async loadFromSupabase() {
   try {
     const { data, error } = await supabase
       .from('usuario')
       .select('id_usuario, nombre, email, pais, ciudad, bio, avatar_url, notificaciones, compacto')
       .eq('id_usuario', this.form.id_local)
       .maybeSingle();


     if (error) throw error;
     if (data) {
       this.form = {
         ...this.form,
         nombre: data.nombre ?? '',
         email: data.email ?? '',
         pais: data.pais ?? '',
         ciudad: data.ciudad ?? '',
         bio: data.bio ?? '',
         avatar_url: data.avatar_url ?? null,
         avatar_preview: data.avatar_url ?? this.form.avatar_preview,
         notificaciones: !!data.notificaciones,
         compacto: !!data.compacto,
       };
     }
   } catch (e) {
     // Silencioso: si no existe la tabla, seguimos en modo local
     console.warn('[Perfil] No se pudo cargar desde Supabase:', e);
   }
 }


 private async upsertToSupabase() {
   try {
     const payload = {
       id_usuario: this.form.id_local,
       nombre: this.form.nombre || null,
       email: this.form.email || null,
       pais: this.form.pais || null,
       ciudad: this.form.ciudad || null,
       bio: this.form.bio || null,
       avatar_url: this.form.avatar_url || null,
       notificaciones: this.form.notificaciones,
       compacto: this.form.compacto,
       updated_at: new Date().toISOString(),
     };


     const { error } = await supabase
       .from('usuario')
       .upsert(payload, { onConflict: 'id_usuario' });


     if (error) throw error;
   } catch (e) {
     console.warn('[Perfil] No se pudo guardar en Supabase:', e);
   }
 }


 // ======================
 //   Avatar / archivos
 // ======================
 onPickAvatar(ev: Event) {
   const input = ev.target as HTMLInputElement;
   const file = input.files?.[0];
   if (!file) return;


   // Preview local
   const reader = new FileReader();
   reader.onload = () => {
     this.form.avatar_preview = String(reader.result);
   };
   reader.readAsDataURL(file);


   // Subida opcional a Supabase storage (bucket 'avatars')
   this.uploadAvatarToSupabase(file).catch(() => {});
 }


 private async uploadAvatarToSupabase(file: File) {
   try {
     const fileExt = file.name.split('.').pop() || 'jpg';
     const filePath = `u_${this.form.id_local}.${fileExt}`;


     const { error: upErr } = await supabase.storage
       .from('avatars')            // 👈 asegurate de crear el bucket "avatars"
       .upload(filePath, file, { upsert: true });


     if (upErr) throw upErr;


     const { data: pub } = supabase.storage
       .from('avatars')
       .getPublicUrl(filePath);


     if (pub?.publicUrl) {
       this.form.avatar_url = pub.publicUrl;
     }
   } catch (e) {
     console.warn('[Perfil] No se pudo subir el avatar a Supabase:', e);
   }
 }


 // ======================
 //   Acciones de UI
 // ======================
 async save() {
   this.saving = true;
   try {
     // 1) Guardar local
     this.saveToLocal();


     // 2) Guardar remoto (si está disponible)
     await this.upsertToSupabase();


     this.lastSaved = new Date();
   } finally {
     this.saving = false;
   }
 }


 resetForm() {
   // No borro el ID local. Restauro a valores "vacíos"
   this.form = {
     ...this.form,
     nombre: '',
     email: '',
     pais: '',
     ciudad: '',
     bio: '',
     avatar_url: null,
     avatar_preview: null,
     notificaciones: true,
     compacto: false,
   };
 }


 async reload(evt?: CustomEvent) {
   // Releer de local + remoto
   this.loadFromLocal();
   await this.loadFromSupabase().catch(() => {});
   (evt?.target as any)?.complete?.();
 }
}






