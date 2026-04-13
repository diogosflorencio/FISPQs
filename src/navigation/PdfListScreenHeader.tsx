import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_VERSION } from '../config/appVersion';
import { APP_COLORS } from '../config/theme';
import { useVersionCheck } from '../context/VersionCheckContext';

export const PdfListScreenHeader: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isOutdated, remoteMensagem } = useVersionCheck();

  const mensagemDoServidor = remoteMensagem.trim();
  const showNotice = isOutdated && mensagemDoServidor.length > 0;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>
          FDS/FISPQs - Meio Ambiente
        </Text>
        <Text style={styles.versionTag}>v{APP_VERSION}</Text>
      </View>
      {showNotice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{mensagemDoServidor}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingVertical: 6,
  },
  title: {
    flex: 1,
    color: APP_COLORS.primaryTextOnPrimary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  versionTag: {
    color: APP_COLORS.primaryTextOnPrimary,
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.95,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  notice: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 235, 59, 0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 235, 59, 0.55)',
  },
  noticeText: {
    color: '#FFFDE7',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
