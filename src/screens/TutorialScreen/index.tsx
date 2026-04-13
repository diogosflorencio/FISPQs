import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../config/theme';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERT_DISMISSED_KEY = '@tutorial_alert_dismissed';

const RADIUS = 1;

type SectionItem = {
  icon: string;
  title: string;
  bullets: string[];
};

const SECTIONS: SectionItem[] = [
  {
    icon: 'info-outline',
    title: 'O que é?',
    bullets: [
      'Acesso rápido às FISPQs/FDS do setor de Meio Ambiente',
      'Funciona online e offline, sempre disponível quando necessário',
    ],
  },
  {
    icon: 'search',
    title: 'Como buscar',
    bullets: [
      'Use a barra de pesquisa por nome ou número do produto',
      'Busca instantânea, sem diferenciar maiúsculas',
      'Resultados filtrados conforme você digita',
    ],
  },
  {
    icon: 'cloud-download',
    title: 'Modo Offline',
    bullets: [
      'FISPQs são baixadas automaticamente ao serem abertas',
      'Ícone verde ✓ indica disponibilidade offline',
      'Sincronização automática quando há conexão',
    ],
  },
  {
    icon: 'storage',
    title: 'Aspectos Técnicos',
    bullets: [
      'Arquivos no Supabase (plano free, é o que temos)',
      'Cache local com compressão para economizar espaço',
      'Sistema de versionamento de documentos',
    ],
  },
  {
    icon: 'sync',
    title: 'Atualizações',
    bullets: [
      'Puxe a tela para baixo para sincronizar manualmente',
      'Novas FISPQs são adicionadas automaticamente',
      'Versões antigas mantidas em cache até a próxima sync',
    ],
  },
  {
    icon: 'mail-outline',
    title: 'Suporte',
    bullets: [
      'Verifique sua conexão e tente sincronizar manualmente',
      'Dúvidas? diogosflorencio@gmail.com, qualquer hora',
    ],
  },
];

export const TutorialScreen: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);

  // const checkAlertStatus = async () => {
  //   try {
  //     const dismissed = await AsyncStorage.getItem(ALERT_DISMISSED_KEY);
  //     if (dismissed === null) setShowAlert(true);
  //   } catch { setShowAlert(true); }
  // };

  // const handleDismissAlert = async () => {
  //   try {
  //     await AsyncStorage.setItem(ALERT_DISMISSED_KEY, 'true');
  //   } catch {}
  //   setShowAlert(false);
  // };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* ── PAGE HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sobre o app</Text>
          <Text style={styles.headerSub}>FISPQs/FDS - Meio Ambiente</Text>
        </View>

       

        {/* ── ALERT BANNER ── */}
        {showAlert && (
          <TouchableOpacity
            style={styles.alertContainer}
            onPress={() => setIsAlertExpanded(!isAlertExpanded)}
            activeOpacity={0.85}
          >
            <View style={styles.alertHeader}>
              <View style={styles.alertIconWrap}>
                <Icon name="warning" size={18} color={APP_COLORS.warning} />
              </View>
              <Text style={styles.alertTitle} numberOfLines={1}>
                Atualização Urgente de Segurança
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  // handleDismissAlert();
                }}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={18} color={APP_COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.alertText}
              numberOfLines={isAlertExpanded ? undefined : 3}
            >
              {'O app passou por uma atualização urgente de segurança exigida pelo Google Play.\n\n'}
              {'Em '}
              <Text style={styles.alertBold}>10 de setembro de 2025</Text>
              {', o Google exigiu suporte a páginas de 16 KB de memória. Sem essa atualização, o app '}
              <Text style={styles.alertBold}>pararia de funcionar a partir de 31 de outubro de 2025</Text>
              {'.\n\nA versão '}
              <Text style={styles.alertBold}>1.1.2 - segurança</Text>
              {' foi lançada para atender essas exigências.\n\n'}
              <Text
                style={styles.alertLink}
                onPress={() =>
                  Linking.openURL(
                    'https://developer.android.com/guide/practices/page-sizes#build'
                  )
                }
              >
                Saiba mais sobre suporte a páginas de 16 KB →
              </Text>
            </Text>

            {!isAlertExpanded && (
              <View style={styles.expandIndicator}>
                <Text style={styles.expandText}>Toque para expandir</Text>
                <Icon name="expand-more" size={16} color={APP_COLORS.warningText} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* ── SECTIONS ── */}
        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Icon name={section.icon} size={20} color={APP_COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <View style={styles.divider} />
            {section.bullets.map((bullet, bi) => (
              <View key={bi} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* ── VERSION BADGE ── */}
        <View style={styles.versionBadge}>
          <Icon name="verified" size={14} color={APP_COLORS.textSecondary} />
          <Text style={styles.versionText}>Versão 1.1.2 - segurança</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── PAGE HEADER ──
  pageHeader: {
    marginBottom: 20,
    paddingTop: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },

  // ── ALERT ──
  alertContainer: {
    backgroundColor: APP_COLORS.warningSurface,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.warningBorder,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  alertIconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS,
    backgroundColor: APP_COLORS.warningExpandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.warningText,
  },
  closeButton: {
    padding: 4,
  },
  alertText: {
    fontSize: 13,
    color: APP_COLORS.warningText,
    lineHeight: 20,
  },
  alertBold: {
    fontWeight: '700',
    color: APP_COLORS.warningText,
  },
  alertLink: {
    color: APP_COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.warningExpandBorder,
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    color: APP_COLORS.warningText,
  },

  // ── CARD ──
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS,
    backgroundColor: APP_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.primary,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: APP_COLORS.background,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: APP_COLORS.primary,
    marginTop: 7,
    opacity: 0.6,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: APP_COLORS.textPrimary,
    lineHeight: 20,
  },

  // ── VERSION ──
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
  },
  header: { alignItems: 'center', paddingVertical: 20, marginBottom: 4 },

  headerTitle: { fontSize: 18, fontWeight: '500', color: APP_COLORS.primary, marginBottom: 2 },
  headerSub: { fontSize: 12, color: APP_COLORS.textSecondary },

});