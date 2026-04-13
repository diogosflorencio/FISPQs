import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { APP_VERSION } from '../config/appVersion';
import { fetchRemoteVersionPayload } from '../services/remoteVersionApi';

type VersionCheckState = {
  remoteVersion: string | null;
  remoteMensagem: string;
  isChecking: boolean;
  /** Versão publicada no repositório difere da versão em código */
  isOutdated: boolean;
  refresh: () => Promise<void>;
};

const VersionCheckContext = createContext<VersionCheckState | null>(null);

function versionsDiffer(remote: string | null): boolean {
  if (remote == null || remote === '') {
    return false;
  }
  return remote !== APP_VERSION.trim();
}

export const VersionCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [remoteMensagem, setRemoteMensagem] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    try {
      const payload = await fetchRemoteVersionPayload();
      if (payload) {
        setRemoteVersion(payload.version);
        setRemoteMensagem(payload.mensagem);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        void refresh();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [refresh]);

  const isOutdated = useMemo(() => versionsDiffer(remoteVersion), [remoteVersion]);

  const value = useMemo<VersionCheckState>(
    () => ({
      remoteVersion,
      remoteMensagem,
      isChecking,
      isOutdated,
      refresh,
    }),
    [remoteVersion, remoteMensagem, isChecking, isOutdated, refresh],
  );

  return <VersionCheckContext.Provider value={value}>{children}</VersionCheckContext.Provider>;
};

export function useVersionCheck(): VersionCheckState {
  const ctx = useContext(VersionCheckContext);
  if (!ctx) {
    throw new Error('useVersionCheck must be used within VersionCheckProvider');
  }
  return ctx;
}
