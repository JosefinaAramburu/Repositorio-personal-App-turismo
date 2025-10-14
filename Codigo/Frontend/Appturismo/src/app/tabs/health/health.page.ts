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
        .from('"Resenas"')
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
    console.log('🔴 MÉTODO agregarResena INICIADO');
    
    if (this.cargando) {
      console.log('🔴 Ya está cargando, saliendo...');
      return;
    }

    this.cargando = true;
    console.log('🔄 Estado cargando:', this.cargando);

    try {
      console.log('🔄 Agregando reseña...');
      console.log('📝 Datos del formulario:', this.nuevaResena);

      // Preparar datos EXACTAMENTE como están en tu tabla
      const datosParaSupabase = {
        texto: (this.nuevaResena.titulo ? this.nuevaResena.titulo + ': ' : '') + this.nuevaResena.contenido,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0], // Solo la fecha (YYYY-MM-DD)
        id_usuario: 1
      };

      console.log('📤 Datos para Supabase:', datosParaSupabase);

      const { data, error } = await this.supabase
        .from('"Resenas"')
        .insert([datosParaSupabase])
        .select();

      console.log('📡 RESPUESTA DE SUPABASE - data:', data);
      console.log('📡 RESPUESTA DE SUPABASE - error:', error);

      if (error) {
        console.error('❌ ERROR de Supabase:', error);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Detalles:', error.details);
        return;
      }

      console.log('✅ Reseña agregada a Supabase, recargando lista...');
      await this.cargarResenas();

      // Limpiar formulario
      this.nuevaResena = {
        titulo: '',
        contenido: '',
        calificacion: 5
      };

      // Ocultar formulario
      this.mostrarFormulario = false;
      console.log('✅ Reseña agregada exitosamente!');

    } catch (error) {
      console.error('❌ ERROR GENERAL:', error);
    } finally {
      this.cargando = false;
      console.log('🔄 Estado cargando al final:', this.cargando);
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

      await this.cargarResenas();
      console.log('✅ Reseña eliminada:', id);

    } catch (error) {
      console.error('❌ Error general:', error);
    }
  }
}