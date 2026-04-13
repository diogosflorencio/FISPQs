import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  Linking, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../config/theme';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const versions = [
  {
    version: '2.0.0',
    date: 'Previsão: agosto/2025',
    badge: 'Pausado',
    badgeStyle: 'paused' as const,
    changes: [
      'Categorização de FISPQs por contrato ou tipo',

      'Notificações e modo escuro',
      'Adição de chat para pedidos de documentos',
      'Adição de moral para adição de item novo adicionado'

    ],
    tech: [
      'Nova arquitetura de banco de dados',
      'API RESTful para sincronização bidirecional',
      'Cache offline com SQLite',
      'Functios realtime pra o chat e moral',
    ],
    note: 'Esta versão tornará as anteriores incompatíveis devido às mudanças estruturais no banco de dados.',
  },
  {
    version: '1.1.3 - impressão e compartilhamento',
    date: 'Abril/2026',
    badge: 'Atual',
    badgeStyle: 'current' as const,
    changes: [
      'Adição de função de impressão de PDF',
      'Adição de função de compartilhamento de PDF',
      'Melhorias na interface de visualização de todas as telas',
    ],
    tech: [
      'Uso do React Native Share para compartilhamento de PDF',
      'Uso do React Native Print para impressão de PDF',
    ],
  },
  {
    version: '1.1.2 - segurança',
    date: 'Outubro/2025',
    changes: [
      'Atualização de segurança exigida pelo Google (páginas de 16 KB)',
      'Ajustes de conformidade e endurecimento de permissões',
      'Melhorias de desempenho e estabilidade',
    ],
    tech: [
      'Revisões em configurações de memória',
      'Ajustes de build para políticas do Google Play',
    ],
  },
  {
    version: '1.1.1 - lançamento ao público',
    date: 'Junho/2025',
    changes: [
      'Ajustes finais de interface e UX',
      'Correções de bugs reportados em testes internos',
      'Publicação na Google Play Store',
    ],
    tech: ['Polimento final da interface', 'Correções de bugs menores'],
  },
  {
    version: '0.1.1 - páginas',
    date: 'Junho/2025',
    changes: [
      'Bottom Tab Navigation',
      'Nova tela de tutorial',
      'Tela Sobre com histórico de versões',
      'Paginação na visualização de PDFs',
    ],
    tech: ['React Navigation v6', 'Refatoração da estrutura de componentes'],
  },
  {
    version: '0.0.1 - natália',
    date: 'Maio/2025',
    changes: [
      'Listagem de FISPQs',
      'Visualização dos documentos em PDF',
      'Sistema de download para uso offline',
      'Busca por nome de arquivo',
    ],
    tech: [
      'Integração com Supabase',
      'Cache local com React Hooks',
      'Implementação do react-native-pdf',
    ],
  },
];

export const VersionScreen: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(prev => (prev === i ? -1 : i));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.header}>
        
          <Text style={styles.headerTitle}>FISPQs/FDS - Meio Ambiente</Text>
          <Text style={styles.headerSub}>Versão 1.1.3 - impressão e compartilhamento</Text>
        </View>

        <Text style={styles.sectionLabel}>Versões </Text>

        {versions.map((v, i) => {
          const isOpen = openIndex === i;
          const isFuture = i === 0;
          return (
            <View key={i} style={[styles.card, i > 0 && i === 1 && { marginTop: 8 }]}>

              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggle(i)}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrap}>
                  <Icon name="new-releases" size={16} color={APP_COLORS.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardVersion}>{v.version}</Text>
                  
                  <Text style={styles.cardDate}>{v.date}</Text>
                </View>
                {v.badge && (
                  <View style={[styles.badge, v.badgeStyle === 'current' ? styles.badgeCurrent : styles.badgePaused]}>
                    <Text style={[styles.badgeText, v.badgeStyle === 'current' ? styles.badgeTextCurrent : styles.badgeTextPaused]}>
                      {v.badge}
                    </Text>
                  </View>
                )}
                <Icon name={isOpen ? 'expand-less' : 'expand-more'} size={20} color="#aaa" />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.cardBody}>
                  <Text style={styles.bodyLabel}>Adições e mudanças</Text>
                  {v.changes.map((c, j) => (
                    <View key={j} style={styles.bodyItem}>
                      <View style={styles.bodyDot} />
                      <Text style={styles.bodyText}>{c}</Text>
                    </View>
                  ))}

                  {v.tech && (
                    <>
                      <Text style={[styles.bodyLabel, styles.bodyLabelMuted]}>Detalhes técnicos</Text>
                      {v.tech.map((t, j) => (
                        <View key={j} style={styles.bodyItem}>
                          <View style={[styles.bodyDot, styles.bodyDotMuted]} />
                          <Text style={[styles.bodyText, styles.bodyTextMuted]}>{t}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {v.note && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{v.note}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerName}>Desenvolvido por Diogo Florêncio</Text>
          <Text
            style={styles.footerEmail}
            onPress={() => Linking.openURL('mailto:diogosflorencio@gmail.com')}
          >
            Contato: diogosflorencio@gmail.com
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 16, paddingBottom: 32 },

  header: { alignItems: 'center', paddingVertical: 20, marginBottom: 4 },
  headerIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: APP_COLORS.primary, marginBottom: 2 },
  headerSub: { fontSize: 12, color: APP_COLORS.textSecondary },

  sectionLabel: {
    fontSize: 11, fontWeight: '500',
    color: APP_COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8, marginTop: 4,
  },

  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: APP_COLORS.border,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 11, padding: 14,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: '#E6F1FB',
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardVersion: { fontSize: 14, fontWeight: '500', color: APP_COLORS.primary },
  cardDate: { fontSize: 11, color: APP_COLORS.textSecondary, marginTop: 1 },

  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, marginRight: 4,
  },
  badgeCurrent: { backgroundColor: '#E6F1FB' },
  badgePaused: { backgroundColor: APP_COLORS.border },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextCurrent: { color: '#0C447C' },
  badgeTextPaused: { color: APP_COLORS.textSecondary },

  cardBody: {
    borderTopWidth: 0.5, borderTopColor: APP_COLORS.border,
    padding: 14,
  },
  bodyLabel: {
    fontSize: 10, fontWeight: '500',
    color: APP_COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: 6, marginTop: 4,
  },
  bodyLabelMuted: { color: APP_COLORS.textMuted, marginTop: 12 },
  bodyItem: { flexDirection: 'row', gap: 8, paddingVertical: 3, alignItems: 'flex-start' },
  bodyDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: APP_COLORS.primary,
    marginTop: 8, flexShrink: 0,
  },
  bodyDotMuted: { backgroundColor: APP_COLORS.textMuted },
  bodyText: { flex: 1, fontSize: 12, color: APP_COLORS.textPrimary, lineHeight: 19 },
  bodyTextMuted: { color: APP_COLORS.textMuted },

  noteBox: {
    backgroundColor: APP_COLORS.surfaceWarningNote,
    borderLeftWidth: 3, borderLeftColor: APP_COLORS.warningBorder,
    padding: 10, marginTop: 10,
  },
  noteText: { fontSize: 11, color: APP_COLORS.warningText, fontStyle: 'italic', lineHeight: 17 },

  footer: {
    marginTop: 8, padding: 16,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 0.5, borderColor: APP_COLORS.border,
  },
  footerName: { fontSize: 13, fontWeight: '500', color: APP_COLORS.textPrimary, marginBottom: 4 },
  footerEmail: { fontSize: 12, color: APP_COLORS.primary, textDecorationLine: 'underline' },
});