/**
 * Exemplo de integração no dashboard (Next.js App Router).
 * Copie lib/fcm.ts a partir de scripts/fcmDashboard.ts e adapte os handlers abaixo.
 *
 * Variável no servidor (Vercel, Railway, etc.):
 *   FIREBASE_SERVICE_ACCOUNT_JSON = conteúdo inteiro do JSON da service account
 *
 * Local:
 *   GOOGLE_APPLICATION_CREDENTIALS=z:\FISPQs\secrets\fds-fispqs-firebase-adminsdk.json
 */

import { notifyAppUpdate, notifyDocumentUpdate, notifyFeedbackApproved, notifyNewAviso } from './fcmDashboard';

// --- Depois de INSERT em avisos (API route do dashboard) ---
export async function onAvisoCriado(input: {
  titulo: string;
  corpo: string;
  avisoId: string;
}) {
  await notifyNewAviso(input.titulo, input.corpo, input.avisoId);
}

// --- Depois de UPDATE feedback_comentarios SET visivel = true ---
export async function onFeedbackAprovado(input: { preview: string; commentId: string }) {
  await notifyFeedbackApproved(input.preview, input.commentId);
}

// --- Depois de upload/rename/substituir PDF no bucket fispqs ---
export async function onPdfAtualizado(fileName: string) {
  await notifyDocumentUpdate(fileName);
}

// --- Depois de publicar nova versão (ex.: atualizar data.json no GitHub) ---
export async function onVersaoPublicada(input: { version: string; mensagem?: string }) {
  await notifyAppUpdate(input.version, input.mensagem);
}

/*
Exemplo App Router — app/api/avisos/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyNewAviso } from '@/lib/fcm';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabase
    .from('avisos')
    .insert({ titulo: body.titulo, corpo: body.corpo, ativo: true, tipo: body.tipo ?? 'info' })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await notifyNewAviso(body.titulo ?? 'Novo aviso', body.corpo ?? '', data.id);
  } catch (fcmError) {
    console.error('FCM aviso:', fcmError);
    // Aviso já foi salvo; push falhou — logar e seguir
  }

  return NextResponse.json({ ok: true, id: data.id });
}
*/
