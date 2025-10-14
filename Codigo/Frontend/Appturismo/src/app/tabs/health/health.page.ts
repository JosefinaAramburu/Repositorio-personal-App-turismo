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

  // MÉTODO NUEVO - más simple para probar
  async probarAgregarResena() {
    console.log('🎯 MÉTODO probarAgregarResena LLAMADO');
    console.log('📝 Datos en el formulario:', this.nuevaResena);
    
    if (this.cargando) {
      console.log('⏳ Ya está cargando...');
      return;
    }

    if (!this.nuevaResena.titulo || !this.nuevaResena.contenido) {
      console.log('❌ Faltan datos en el formulario');
      alert('Por favor completa todos los campos');
      return;
    }

    this.cargando = true;
    console.log('🔄 Iniciando proceso de agregar...');

    // Llamar al método original
    await this.agregarResena();
  }

  async agregarResena() {
    try {
      console.log('🔄 Agregando reseña a Supabase...');

      const datosParaSupabase = {
        texto: (this.nuevaResena.titulo ? this.nuevaResena.titulo + ': ' : '') + this.nuevaResena.contenido,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0],
        id_usuario: 1
      };

      console.log('📤 Enviando a Supabase:', datosParaSupabase);

      const { data, error } = await this.supabase
        .from('"Resenas"')
        .insert([datosParaSupabase])
        .select();

      console.log('📡 Respuesta de Supabase - data:', data);
      console.log('📡 Respuesta de Supabase - error:', error);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        alert('Error: ' + error.message);
        return;
      }

      console.log('✅ Reseña agregada, recargando lista...');
      await this.cargarResenas();

      // Limpiar y cerrar
      this.nuevaResena = { titulo: '', contenido: '', calificacion: 5 };
      this.mostrarFormulario = false;

      console.log('🎉 Reseña agregada exitosamente!');
      alert('Reseña agregada correctamente!');

    } catch (error) {
      console.error('❌ Error general:', error);
      alert('Error al agregar reseña');
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

      await this.cargarResenas();
      console.log('✅ Reseña eliminada:', id);

    } catch (error) {
      console.error('❌ Error general:', error);
    }
  }
}