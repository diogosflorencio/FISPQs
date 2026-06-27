/**
 * Copie este módulo para o dashboard (Node/Next API route).
 * Nunca exponha o JSON da service account no frontend.
 */
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'fds-fispqs';

export const FCM_TOPICS = {
  avisos: 'fispqs_avisos',
  feedbacks: 'fispqs_feedbacks',
  docs: 'fispqs_docs',
  app: 'fispqs_app',
} as const;

export type FcmTopicKey = keyof typeof FCM_TOPICS;

const TYPE_BY_TOPIC: Record<FcmTopicKey, string> = {
  avisos: 'aviso',
  feedbacks: 'feedback',
  docs: 'doc',
  app: 'app',
};

export type SendFcmOptions = {
  topic: FcmTopicKey;
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function getGoogleAuth(): Promise<GoogleAuth> {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    return new GoogleAuth({
      credentials: JSON.parse(inlineJson) as Record<string, unknown>,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
  }
  return new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
}

async function getFcmAccessToken(): Promise<string> {
  const auth = await getGoogleAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) {
    throw new Error(
      'FCM: defina FIREBASE_SERVICE_ACCOUNT_JSON (servidor) ou GOOGLE_APPLICATION_CREDENTIALS (local).',
    );
  }
  return token.token;
}

/** Envia push para todos os apps inscritos no tópico. */
export async function sendFcmToTopic(options: SendFcmOptions): Promise<unknown> {
  const topicName = FCM_TOPICS[options.topic];
  const accessToken = await getFcmAccessToken();

  const payload = {
    message: {
      topic: topicName,
      notification: {
        title: options.title,
        body: options.body,
      },
      data: {
        type: TYPE_BY_TOPIC[options.topic],
        ...Object.fromEntries(
          Object.entries(options.data ?? {}).map(([k, v]) => [k, String(v)]),
        ),
      },
      android: { priority: 'high' as const },
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`FCM ${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

/** Chame após criar aviso no Supabase. */
export async function notifyNewAviso(titulo: string, corpo: string, avisoId?: string) {
  return sendFcmToTopic({
    topic: 'avisos',
    title: titulo || 'Novo aviso no mural',
    body: corpo.slice(0, 180),
    data: avisoId ? { aviso_id: avisoId } : undefined,
  });
}

/** Chame ao aprovar comentário (visivel = true). */
export async function notifyFeedbackApproved(preview: string, commentId?: string) {
  return sendFcmToTopic({
    topic: 'feedbacks',
    title: 'Novo comentário publicado',
    body: preview.slice(0, 180),
    data: commentId ? { comment_id: commentId } : undefined,
  });
}

/** Chame ao subir, renomear ou substituir PDF no Storage. */
export async function notifyDocumentUpdate(fileName: string) {
  return sendFcmToTopic({
    topic: 'docs',
    title: 'Documento atualizado',
    body: fileName,
    data: { file_name: fileName },
  });
}

/** Chame ao publicar nova versão do app. */
export async function notifyAppUpdate(version: string, mensagem?: string) {
  return sendFcmToTopic({
    topic: 'app',
    title: `Atualização ${version}`,
    body: mensagem ?? 'Uma nova versão do FISPQs está disponível.',
    data: { version },
  });
}
