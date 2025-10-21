import { Injectable } from '@angular/core';
import { supabase } from '../supabase';


@Injectable({ providedIn: 'root' })
export class DatabaseService {


  // Obtener todos los registros de una tabla
  async getAll(table: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  }


  // Insertar un registro nuevo
  async insert(table: string, record: any) {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select();
    if (error) throw error;
    return data;
  }


  // Actualizar un registro existente por id
  async update(table: string, idField: string, id: number, record: any) {
    const { data, error } = await supabase
      .from(table)
      .update(record)
      .eq(idField, id)
      .select();
    if (error) throw error;
    return data;
  }


  // Eliminar un registro por id
  async delete(table: string, idField: string, id: number) {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq(idField, id)
      .select();
    if (error) throw error;
    return data;
  }


  // Ejemplo: obtener eventos con su destino (JOIN)
  async getEventosWithDestino() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, destino(*)')
      .order('fecha_de_inicio', { ascending: true });
    if (error) throw error;
    return data || [];
  }
}


