import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_COLORS } from '../../config/theme';
import { fetchAvisosAtivos, type Aviso } from '../../services/avisosService';
import { sanitizePlainText } from '../../utils/sanitizeText';

const RADIUS = 1;

function displaySafe(s: string | null | undefined, max: number): string {
  if (s == null) return '';
  return sanitizePlainText(s, max);
}

function tipoBorder(tipo: Aviso['tipo']): string {
  switch (tipo) {
    case 'urgente':
      return APP_COLORS.error;
    case 'aviso':
      return APP_COLORS.warning;
    default:
      return APP_COLORS.primary;
  }
}

function tipoLabel(tipo: Aviso['tipo']): string {
  switch (tipo) {
    case 'urgente':
      return 'Urgente';
    case 'aviso':
      return 'Aviso';
    default:
      return 'Info';
  }
}

export const AvisosScreen: React.FC = () => {
  const [items, setItems] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAvisosAtivos();
      setItems(data);
    } catch (e) {
      console.error(e);
      setError('Não foi possível carregar os avisos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const formatData = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={APP_COLORS.secondary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_COLORS.primary]} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mural de avisos</Text>
            <Text style={styles.headerSub}>
              Conteúdo gerenciado por Natália. Aqui aparecem comunicados internos e lembretes importantes como o aviso de FDS lançado.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {items.length === 0 && !error ? (
            <Text style={styles.empty}>Nenhum aviso no momento.</Text>
          ) : null}

          {items.map(item => {
            const titulo = item.titulo ? displaySafe(item.titulo, 200) : null;
            const corpo = displaySafe(item.corpo, 8000);
            const border = tipoBorder(item.tipo);

            return (
              <View key={item.id} style={[styles.card, { borderLeftColor: border }]}>
                <View style={styles.cardHead}>
                  <View style={[styles.tipoPill, { borderColor: border }]}>
                    <Text style={[styles.tipoText, { color: border }]}>{tipoLabel(item.tipo)}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Icon name="schedule" size={14} color={APP_COLORS.textMuted} />
                    <Text style={styles.dateText}>{formatData(item.created_at)}</Text>
                  </View>
                </View>
                {titulo ? <Text style={styles.cardTitulo}>{titulo}</Text> : null}
                <Text style={styles.cardCorpo}>{corpo}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  errorText: {
    color: APP_COLORS.error,
    marginBottom: 12,
    fontSize: 14,
  },
  empty: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 12,
    elevation: 1,

  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: APP_COLORS.textMuted,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 8,
  },
  cardCorpo: {
    fontSize: 14,
    color: APP_COLORS.textPrimary,
    lineHeight: 21,
  },
});
