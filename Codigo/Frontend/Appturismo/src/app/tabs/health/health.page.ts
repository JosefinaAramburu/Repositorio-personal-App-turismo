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
        .from('resenas')  // ✅ MINÚSCULA
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('❌ Error cargando reseñas:', error);
        alert('Error al cargar reseñas: ' + error.message);
        return;
      }

      this.resenas = data || [];
      console.log('✅ Reseñas cargadas:', this.resenas.length);

    } catch (error) {
      console.error('❌ Error general:', error);
      alert('Error inesperado al cargar reseñas');
    }
  }

  async probarAgregarResena() {
    if (this.cargando) return;
    
    if (!this.nuevaResena.titulo.trim() || !this.nuevaResena.contenido.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }

    this.cargando = true;
    await this.agregarResena();
  }

  async agregarResena() {
    try {
      const datosParaSupabase = {
        texto: `${this.nuevaResena.titulo.trim()}: ${this.nuevaResena.contenido.trim()}`,
        puntuacion: this.nuevaResena.calificacion,
        fecha: new Date().toISOString().split('T')[0],
        id_usuario: 1
      };

      console.log('📤 Enviando a Supabase:', datosParaSupabase);

      const { data, error } = await this.supabase
        .from('resenas')  // ✅ MINÚSCULA
        .insert([datosParaSupabase])
        .select();

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
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

    try {
      const { error } = await this.supabase
        .from('resenas')  // ✅ MINÚSCULA
        .delete()
        .eq('id_resenas', id);

      if (error) {
        console.error('❌ Error eliminando reseña:', error);
        alert('Error al eliminar reseña: ' + error.message);
        return;
      }

      await this.cargarResenas();
      console.log('✅ Reseña eliminada:', id);
      alert('Reseña eliminada correctamente');

    } catch (error) {
      console.error('❌ Error general:', error);
      alert('Error al eliminar reseña');
    }
  }

  // Métodos para mostrar título y contenido
  obtenerTitulo(resena: any): string {
    if (!resena.texto) return 'Sin título';
    const partes = resena.texto.split(':');
    return partes[0]?.trim() || 'Sin título';
  }

  obtenerContenido(resena: any): string {
    if (!resena.texto) return 'Sin contenido';
    const partes = resena.texto.split(':');
    return partes.length > 1 ? partes.slice(1).join(':').trim() : resena.texto;
  }
}