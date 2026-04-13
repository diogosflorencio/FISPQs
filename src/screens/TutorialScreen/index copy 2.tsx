import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../config/theme';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const AUTO_ADVANCE_MS = 5000;

const tutorialCards = [
  {
    label: 'Sobre o app',
    title: 'O que é?',
    icon: 'info-outline',
    items: [
      'App para acesso às FISPQs/FDS do setor de Meio Ambiente.',
      'Permite acessar os documentos online e offline, com acesso rápido às informações de segurança quando necessário.',
    ],
  },
  {
    label: 'Dica de uso',
    title: 'Como buscar FISPQs/FDS',
    icon: 'search',
    items: [
      'Use a barra de pesquisa para buscar por nome ou número do produto.',
      'A busca é instantânea e não diferencia maiúsculas de minúsculas.',
      'Os resultados são filtrados conforme você digita.',
    ],
  },
  {
    label: 'Dica de uso',
    title: 'Modo offline',
    icon: 'cloud-download',
    items: [
      'Os FDS/FISPQs são baixados ao serem visualizados, basta tocar.',
      'Ícone verde indica que a FISPQ está disponível offline.',
      'Você pode acessar FISPQs baixadas mesmo sem internet.',
      'O app sincroniza automaticamente quando há conexão.',
    ],
  },
  {
    label: 'Técnico',
    title: 'Aspectos técnicos',
    icon: 'storage',
    items: [
      'Arquivos armazenados no Supabase (plano free, é osso).',
      'Sincronização automática com o banco de dados em nuvem.',
      'Cache local para acesso offline.',
      'Compressão de dados para economia de espaço.',
    ],
  },
  {
    label: 'Dica de uso',
    title: 'Atualizações',
    icon: 'sync',
    items: [
      'Puxe a tela para baixo para sincronizar manualmente.',
      'Novas FISPQs são adicionadas automaticamente.',
      'Versões antigas mantidas em cache até a próxima sincronização.',
    ],
  },
  {
    label: 'Ajuda',
    title: 'Suporte',
    icon: 'chat-bubble-outline',
    items: [
      'Verifique sua conexão com a internet se algo não carregar.',
      'Tente sincronizar manualmente puxando a tela.',
      'Contato: diogosflorencio@gmail.com',
    ],
  },
];

const TOTAL = tutorialCards.length;

export const TutorialScreen: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [autoProgress, setAutoProgress] = useState(0); // 0-1
  const translateX = useRef(new Animated.Value(0)).current;
  const autoRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const userInteracted = useRef(false);

  const goTo = useCallback(
    (next: number, fromSwipe = false) => {
      const wrapped = ((next % TOTAL) + TOTAL) % TOTAL;
      setCurrent(wrapped);
      translateX.setValue(0);
      userInteracted.current = fromSwipe;
    },
    [translateX],
  );

  const startAutoTimer = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    progressAnim.setValue(0);
    userInteracted.current = false;

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !userInteracted.current) {
        setCurrent(c => ((c + 1) % TOTAL));
        translateX.setValue(0);
      }
    });
  }, [progressAnim, translateX]);

  useEffect(() => {
    startAutoTimer();
    return () => {
      progressAnim.stopAnimation();
    };
  }, [current, startAutoTimer]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderGrant: () => {
        userInteracted.current = true;
        progressAnim.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            setCurrent(c => ((c + 1) % TOTAL));
            translateX.setValue(0);
          });
        } else if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            setCurrent(c => ((c - 1 + TOTAL) % TOTAL));
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => startAutoTimer());
        }
      },
    }),
  ).current;

  const handleNavPress = (dir: 1 | -1) => {
    userInteracted.current = true;
    progressAnim.stopAnimation();
    const dir_val = dir === 1 ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(translateX, {
      toValue: dir_val,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setCurrent(c => ((c + dir + TOTAL) % TOTAL));
      translateX.setValue(0);
    });
  };

  const prevIdx = ((current - 1) + TOTAL) % TOTAL;
  const nextIdx = (current + 1) % TOTAL;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const cardOpacityNext = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.5, 0.5],
    extrapolate: 'clamp',
  });
  const cardScaleNext = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0],
    outputRange: [1, 0.94],
    extrapolate: 'clamp',
  });
  const cardOpacityPrev = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 0.5, 1],
    extrapolate: 'clamp',
  });
  const cardScalePrev = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [0.94, 1],
    extrapolate: 'clamp',
  });

  const renderCard = (idx: number) => {
    const card = tutorialCards[idx];
    return (
      <View style={styles.cardInner}>
        <View style={styles.cardIconWrap}>
          <Icon name={card.icon} size={22} color={APP_COLORS.primary} />
        </View>
        <Text style={styles.cardLabel}>{card.label}</Text>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <View style={styles.itemsWrap}>
          {card.items.map((item, j) => (
            <View key={j} style={styles.item}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={APP_COLORS.background} />

      <View style={styles.container}>
        {/* Stack area */}
        <View style={styles.stackArea} {...panResponder.panHandlers}>

          {/* Card atrás (próximo) */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBehindNext,
              { opacity: cardOpacityNext, transform: [{ scale: cardScaleNext }] },
            ]}
            pointerEvents="none"
          >
            {renderCard(nextIdx)}
          </Animated.View>

          {/* Card atrás (anterior) */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBehindPrev,
              { opacity: cardOpacityPrev, transform: [{ scale: cardScalePrev }] },
            ]}
            pointerEvents="none"
          >
            {renderCard(prevIdx)}
          </Animated.View>

          {/* Card principal */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ translateX }] },
            ]}
          >
            {renderCard(current)}

            {/* Contador de progresso */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            {/* Navegação */}
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.navBtn} onPress={() => handleNavPress(-1)}>
                <Icon name="chevron-left" size={20} color={APP_COLORS.primary} />
                <Text style={styles.navBtnText}>Anterior</Text>
              </TouchableOpacity>

              <View style={styles.dots}>
                {tutorialCards.map((_, i) => (
                  <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
                ))}
              </View>

              <TouchableOpacity style={styles.navBtn} onPress={() => handleNavPress(1)}>
                <Text style={styles.navBtnText}>Próxima</Text>
                <Icon name="chevron-right" size={20} color={APP_COLORS.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <Text style={styles.footerText}>Versão 1.1.2 - segurança</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'space-between',
  },

  stackArea: {
    flex: 1,
    position: 'relative',
    marginBottom: 8,
  },

  card: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: APP_COLORS.border,
    elevation: 3,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardFront: {
    zIndex: 10,
    top: 0,
    elevation: 6,
  },
  cardBehindNext: {
    zIndex: 8,
    top: 10,
    left: 8,
    right: 8,
  },
  cardBehindPrev: {
    zIndex: 7,
    top: 18,
    left: 14,
    right: 14,
  },

  cardInner: {
    flex: 1,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 1,
    backgroundColor: '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: APP_COLORS.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: APP_COLORS.primary,
    marginBottom: 20,
    lineHeight: 30,
  },
  itemsWrap: {
    flex: 1,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: APP_COLORS.primary,
    marginTop: 8,
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: APP_COLORS.textPrimary,
    lineHeight: 22,
  },

  progressTrack: {
    height: 3,
    backgroundColor: APP_COLORS.border,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 2,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 4,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: APP_COLORS.primary,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: APP_COLORS.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: APP_COLORS.primary,
  },

  footerText: {
    fontSize: 11,
    color: APP_COLORS.textMuted,
    textAlign: 'center',
  },
});