import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_COLORS } from '../../config/theme';
import {
  enviarComentario,
  fetchComentariosVisiveis,
  incrementarCoracao,
  type FeedbackComentario,
} from '../../services/feedbackService';
import { sanitizePlainText } from '../../utils/sanitizeText';

const RADIUS = 1;
const HEARTS_STORAGE_KEY = '@fispqs_feedback_coracoes_votados';

function displaySafe(s: string | null | undefined, max = 8000): string {
  if (s == null) return '';
  return sanitizePlainText(s, max);
}

export const FeedbackScreen: React.FC = () => {
  const [items, setItems] = useState<FeedbackComentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [corpo, setCorpo] = useState('');
  const [sending, setSending] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());

  const loadHearted = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HEARTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setHeartedIds(new Set(parsed));
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchComentariosVisiveis();
      setItems(data);
    } catch (e) {
      console.error(e);
      setError('Não foi possível carregar os comentários. Verifique a conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHearted();
    void load();
  }, [load, loadHearted]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const onEnviar = async () => {
    setSending(true);
    try {
      await enviarComentario(corpo, nome);
      setCorpo('');
      setNome('');
      setFormAberto(false);
      Alert.alert(
        'Enviado',
        'Seu comentário foi recebido. Ele aparecerá nesta lista após análise e publicação.',
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível enviar.';
      Alert.alert('Envio', msg);
    } finally {
      setSending(false);
    }
  };

  const markHearted = async (id: string) => {
    const next = new Set(heartedIds);
    next.add(id);
    setHeartedIds(next);
    try {
      await AsyncStorage.setItem(HEARTS_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const onHeart = async (item: FeedbackComentario) => {
    if (heartedIds.has(item.id)) return;
    try {
      await incrementarCoracao(item.id);
      await markHearted(item.id);
      setItems(prev =>
        prev.map(c =>
          c.id === item.id ? { ...c, coracoes: c.coracoes + 1 } : c,
        ),
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível registrar o coração.');
    }
  };

  const renderItem = ({ item }: { item: FeedbackComentario }) => {
    const nomeSafe = displaySafe(item.nome_exibicao, 120);
    const corpoSafe = displaySafe(item.corpo);
    const respostaSafe = item.resposta ? displaySafe(item.resposta) : null;
    const jaCurtiu = heartedIds.has(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Icon name="person-outline" size={18} color={APP_COLORS.primary} />
          <Text style={styles.nome}>{nomeSafe}</Text>
        </View>
        <Text style={styles.corpo}>{corpoSafe}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.heartBtn, jaCurtiu && styles.heartBtnDisabled]}
            onPress={() => onHeart(item)}
            disabled={jaCurtiu}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name={jaCurtiu ? 'favorite' : 'favorite-border'}
              size={20}
              color={jaCurtiu ? APP_COLORS.error : APP_COLORS.textSecondary}
            />
            <Text style={styles.heartCount}>{item.coracoes}</Text>
          </TouchableOpacity>
        </View>
        {respostaSafe ? (
          <View style={styles.respostaBox}>
            <Text style={styles.respostaLabel}>Resposta</Text>
            <Text style={styles.respostaText}>{respostaSafe}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback</Text>
        <Text style={styles.headerSub}>
          Envie sugestões, pedidos de novas FISPQs/FDS ou comentários sobre o aplicativo. Os
          comentários publicados aparecem aqui após análise.
        </Text>
      </View>

      <View style={styles.formSection}>
        {!formAberto ? (
          <TouchableOpacity
            style={styles.btnNovoFeedback}
            onPress={() => setFormAberto(true)}
            activeOpacity={0.85}
          >
            <Icon name="rate-review" size={22} color={APP_COLORS.primary} />
            <Text style={styles.btnNovoFeedbackText}>Novo comentário</Text>
            <Icon name="expand-more" size={22} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.formCardHeader}>
              <Text style={styles.formCardTitle}>Escrever feedback</Text>
              <TouchableOpacity
                onPress={() => setFormAberto(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.btnOcultar}>Ocultar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Nome (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Deixe em branco para ficar anônimo"
              placeholderTextColor={APP_COLORS.textMuted}
              value={nome}
              onChangeText={setNome}
              maxLength={120}
              editable={!sending}
            />
            <Text style={styles.label}>Comentário</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Escreva seu feedback..."
              placeholderTextColor={APP_COLORS.textMuted}
              value={corpo}
              onChangeText={setCorpo}
              multiline
              maxLength={4000}
              textAlignVertical="top"
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.btnEnviar, sending && styles.btnEnviarDisabled]}
              onPress={onEnviar}
              disabled={sending || corpo.trim().length < 3}
            >
              {sending ? (
                <ActivityIndicator color={APP_COLORS.primaryTextOnPrimary} />
              ) : (
                <Text style={styles.btnEnviarText}>Enviar feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.listTitle}>Comentários publicados</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={APP_COLORS.secondary} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListHeaderComponent={header}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_COLORS.primary]} />
            }
            ListEmptyComponent={
              <Text style={[styles.empty, error ? styles.emptyError : null]}>
                {error ?? 'Nenhum comentário publicado ainda.'}
              </Text>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBlock: { marginBottom: 8 },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: APP_COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  btnNovoFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: APP_COLORS.surface,
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    elevation: 1,
  },
  btnNovoFeedbackText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.primary,
  },
  formCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: RADIUS,
    padding: 14,
    elevation: 1,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
  },
  btnOcultar: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.secondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: APP_COLORS.textPrimary,
    marginBottom: 12,
    backgroundColor: APP_COLORS.surfaceMuted,
  },
  inputMultiline: {
    minHeight: 100,
    maxHeight: 220,
  },
  btnEnviar: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS,
    alignItems: 'center',
  },
  btnEnviarDisabled: {
    opacity: 0.6,
  },
  btnEnviarText: {
    color: APP_COLORS.primaryTextOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nome: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    flex: 1,
  },
  corpo: {
    fontSize: 14,
    color: APP_COLORS.textPrimary,
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartBtnDisabled: {
    opacity: 0.85,
  },
  heartCount: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  respostaBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.divider,
    backgroundColor: 'rgba(129, 230, 179, 0.58)',
    marginHorizontal: -14,
    marginBottom: -14,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },
  respostaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.primary,
    marginBottom: 4,
  },
  respostaText: {
    fontSize: 13,
    color: APP_COLORS.textPrimary,
    lineHeight: 19,
  },
  empty: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  emptyError: {
    color: APP_COLORS.error,
  },
});
