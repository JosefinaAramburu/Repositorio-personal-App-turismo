import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss']
})
export class HealthPage implements OnInit {
  resenas: any[] = [];
  cargando = false;
  mostrarFormulario = false;

  nuevaResena = {
    titulo: '',
    contenido: '',
    calificacion: 5
  };

  private supabase = createClient(
    'https://xqznsyyloofllzkywohl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxem5zeXlsb29mbGx6a3l3b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDk4MTksImV4cCI6MjA3MDY4NTgxOX0.rqIz8miQTNRPLWuNXE4LDwCQY2UT-f6IgRBaChszeOk'
  );

  async ngOnInit() {
    await this.cargarResenas();
  }

  async cargarResenas() {
    try {
      console.log('🔄 Cargando reseñas desde Supabase...');
      
      const { data, error } = await this.supabase
        .from('"Resenas"') // ← COMILLAS DOBLES para tablas con mayúsculas
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('❌ Error cargando reseñas:', error);
        return;
      }

      this.resenas = data || [];
      console.log('✅ Reseñas cargadas:', this.resenas);

    } catch (error) {
      console.error('❌ Error general:', error);
    }
  }

  async agregarResena() {
    if (this.cargando) return;

    this.cargando = true;

    try {
      console.log('🔄 Agregando reseña...');

      const { data, error } = await this.supabase
        .from('"Resenas"') // ← COMILLAS DOBLES para tablas con mayúsculas
        .insert([{
          texto: (this.nuevaResena.titulo ? this.nuevaResena.titulo + ': ' : '') + this.nuevaResena.contenido,
          puntuacion: this.nuevaResena.calificacion,
          fecha: new Date().toISOString(),
          id_usuario: 1 // ← Necesitamos este campo por la FK
        }])
        .select();

      console.log('📡 RESPUESTA DE SUPABASE - data:', data);
      console.log('📡 RESPUESTA DE SUPABASE - error:', error);

      if (error) {
        console.error('❌ Error agregando reseña:', error);
        return;
      }

      // 1. Recargar las reseñas desde Supabase
      await this.cargarResenas();

      // 2. Limpiar formulario
      this.nuevaResena = {
        titulo: '',
        contenido: '',
        calificacion: 5
      };

      // 3. Ocultar el formulario
      this.mostrarFormulario = false;

      console.log('✅ Reseña agregada exitosamente!');

    } catch (error) {
      console.error('❌ Error general:', error);
    } finally {
      this.cargando = false;
    }
  }

  async eliminarResena(id: number) {
    try {
      console.log('🔄 Eliminando reseña...');

      const { error } = await this.supabase
        .from('"Resenas"') 
        .delete()
        .eq('id_resenas', id);

      if (error) {
        console.error('❌ Error eliminando reseña:', error);
        return;
      }

      // Recargar las reseñas después de eliminar
      await this.cargarResenas();
      console.log('✅ Reseña eliminada:', id);

    } catch (error) {
      console.error('❌ Error general:', error);
    }
  }
}