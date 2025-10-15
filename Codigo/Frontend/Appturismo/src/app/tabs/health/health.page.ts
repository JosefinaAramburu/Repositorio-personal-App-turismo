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
        .from('Resenas')  // Sin comillas adicionales
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

  // Método mejorado para obtener título
  obtenerTitulo(resena: any): string {
    if (!resena.texto) return 'Sin título';
    
    const partes = resena.texto.split(':');
    return partes[0]?.trim() || 'Sin título';
  }

  // Método mejorado para obtener contenido
  obtenerContenido(resena: any): string {
    if (!resena.texto) return 'Sin contenido';
    
    const partes = resena.texto.split(':');
    if (partes.length > 1) {
      return partes.slice(1).join(':').trim();
    }
    return resena.texto;
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
        fecha: new Date().toISOString().split('T')[0], // Solo la fecha (YYYY-MM-DD)
        id_usuario: 1 // Temporal - luego puedes usar auth
      };

      const { data, error } = await this.supabase
        .from('Resenas')
        .insert([datosParaSupabase])
        .select();

      if (error) throw error;

      // Agregar la nueva reseña al array sin recargar todo
      if (data && data[0]) {
        this.resenas.unshift(data[0]); // Agregar al inicio
      }

      // Limpiar formulario
      this.nuevaResena = { titulo: '', contenido: '', calificacion: 5 };
      this.mostrarFormulario = false;

      alert('✅ Reseña agregada correctamente!');

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error al agregar reseña: ' + error.message);
    } finally {
      this.cargando = false;
    }
  }

  async eliminarResena(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

    try {
      const { error } = await this.supabase
        .from('Resenas')
        .delete()
        .eq('id_resenas', id);

      if (error) throw error;

      // Eliminar del array local sin recargar
      this.resenas = this.resenas.filter(r => r.id_resenas !== id);
      
      alert('✅ Reseña eliminada correctamente');

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error al eliminar reseña: ' + error.message);
    }
  }
}