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

  nuevaResena = {
    titulo: '',
    contenido: '',
    calificacion: 5
  };

  // Configuración de Supabase DIRECTAMENTE aquí
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
        .from('resenas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

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
        .from('resenas')
        .insert([{
          titulo: this.nuevaResena.titulo,
          contenido: this.nuevaResena.contenido,
          calificacion: this.nuevaResena.calificacion,
          fecha_creacion: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ Error agregando reseña:', error);
        return;
      }

      // Agregar la nueva reseña al array local
      if (data && data.length > 0) {
        this.resenas.unshift(data[0]);
        console.log('✅ Reseña agregada exitosamente:', data[0]);
      }

      // Limpiar formulario
      this.nuevaResena = {
        titulo: '',
        contenido: '',
        calificacion: 5
      };

    } catch (error) {
      console.error('❌ Error general:', error);
    } finally {
      this.cargando = false;
    }
  }

  async eliminarResena(id: string) {
    try {
      console.log('🔄 Eliminando reseña...');

      const { error } = await this.supabase
        .from('resenas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando reseña:', error);
        return;
      }

      // Remover del array local
      this.resenas = this.resenas.filter(resena => resena.id !== id);
      console.log('✅ Reseña eliminada:', id);

    } catch (error) {
      console.error('❌ Error general:', error);
    }
  }
}