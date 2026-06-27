/** Tópicos FCM — o dashboard envia push para estes nomes. */
export const FCM_TOPICS = {
  avisos: 'fispqs_avisos',
  feedbacks: 'fispqs_feedbacks',
  docs: 'fispqs_docs',
  app: 'fispqs_app',
} as const;

export type FcmNotificationType = 'aviso' | 'feedback' | 'doc' | 'app';

export type FcmNotificationData = {
  type?: FcmNotificationType;
  aviso_id?: string;
  comment_id?: string;
  file_name?: string;
};
