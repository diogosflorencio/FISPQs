import { supabase } from '../config/supabase';

export type Aviso = {
  id: string;
  created_at: string;
  titulo: string | null;
  corpo: string;
  ativo: boolean;
  tipo: 'info' | 'aviso' | 'urgente';
};

export async function fetchAvisosAtivos(): Promise<Aviso[]> {
  const { data, error } = await supabase
    .from('avisos')
    .select('id, created_at, titulo, corpo, ativo, tipo')
    .eq('ativo', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Aviso[];
}
