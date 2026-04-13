import { REMOTE_VERSION_JSON_URL } from '../config/appVersion';

export type RemoteVersionPayload = {
  version: string;
  mensagem: string;
  status: string;
};

export async function fetchRemoteVersionPayload(): Promise<RemoteVersionPayload | null> {
  try {
    const res = await fetch(REMOTE_VERSION_JSON_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    return {
      version: String(data.version ?? '').trim(),
      mensagem: String(data.mensagem ?? ''),
      status: String(data.status ?? '').trim(),
    };
  } catch {
    return null;
  }
}
