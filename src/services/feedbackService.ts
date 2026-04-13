import { supabase } from '../config/supabase';
import { sanitizePlainText } from '../utils/sanitizeText';

export type FeedbackComentario = {
  id: string;
  created_at: string;
  nome_exibicao: string;
  corpo: string;
  visivel: boolean;
  resposta: string | null;
  coracoes: number;
};

const MAX_CORPO = 4000;
const MAX_NOME = 120;

export async function fetchComentariosVisiveis(): Promise<FeedbackComentario[]> {
  const { data, error } = await supabase
    .from('feedback_comentarios')
    .select('id, created_at, nome_exibicao, corpo, visivel, resposta, coracoes')
    .eq('visivel', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as FeedbackComentario[];
}

export async function enviarComentario(corpo: string, nomeOpcional: string): Promise<void> {
  const corpoLimpo = sanitizePlainText(corpo, MAX_CORPO);
  const nomeTrim = sanitizePlainText(nomeOpcional, MAX_NOME);

  if (corpoLimpo.length < 3) {
    throw new Error('Comentário muito curto.');
  }

  const { error } = await supabase.from('feedback_comentarios').insert({
    corpo: corpoLimpo,
    nome_exibicao: nomeTrim.length > 0 ? nomeTrim : '',
    visivel: false,
  });

  if (error) throw error;
}

export async function incrementarCoracao(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_feedback_coracoes', {
    p_comment_id: commentId,
  });
  if (error) throw error;
}
