#!/usr/bin/env node
/**
 * Envia notificação push via FCM v1 (tópicos do app FISPQs).
 *
 * Pré-requisito: service account do Firebase em GOOGLE_APPLICATION_CREDENTIALS
 * (Firebase Console → Configurações → Contas de serviço → Gerar nova chave privada)
 *
 * Exemplos:
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\secrets\fds-fispqs-firebase.json
 *   node scripts/send-push-notification.mjs avisos "Novo aviso" "Manutenção amanhã"
 *   node scripts/send-push-notification.mjs feedbacks "Novo comentário" "Um feedback foi publicado"
 *   node scripts/send-push-notification.mjs docs "PDF atualizado" "Documento revisado" --file_name="Conami - FDS - X.pdf"
 *   node scripts/send-push-notification.mjs app "Atualização" "Nova versão disponível na loja"
 */

import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'fds-fispqs';

const TOPICS = {
  avisos: 'fispqs_avisos',
  feedbacks: 'fispqs_feedbacks',
  docs: 'fispqs_docs',
  app: 'fispqs_app',
};

const TYPE_BY_TOPIC = {
  avisos: 'aviso',
  feedbacks: 'feedback',
  docs: 'doc',
  app: 'app',
};

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error(
      'Token OAuth vazio. Defina GOOGLE_APPLICATION_CREDENTIALS com o JSON da service account.',
    );
  }
  return tokenResponse.token;
}

async function sendPush({ topicKey, title, body, data = {} }) {
  const topic = TOPICS[topicKey];
  if (!topic) {
    throw new Error(`Tópico inválido: ${topicKey}. Use: ${Object.keys(TOPICS).join(', ')}`);
  }

  const accessToken = await getAccessToken();
  const payload = {
    message: {
      topic,
      notification: { title, body },
      data: {
        type: TYPE_BY_TOPIC[topicKey],
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, String(value)]),
        ),
      },
      android: { priority: 'high' },
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
    throw new Error(`FCM erro ${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const [, , topicKey, title, body, ...rest] = process.argv;
const extra = {};
for (const arg of rest) {
  const match = arg.match(/^--([\w_]+)=(.+)$/);
  if (match) {
    extra[match[1]] = match[2];
  }
}

if (!topicKey || !title || !body) {
  console.error(
    'Uso: node scripts/send-push-notification.mjs <avisos|feedbacks|docs|app> "Título" "Corpo" [--chave=valor]',
  );
  process.exit(1);
}

sendPush({ topicKey, title, body, data: extra })
  .then(result => {
    console.log('Push enviado:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error(error.message ?? error);
    process.exit(1);
  });
