import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PDFService from '../../services/PdfService';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import { APP_COLORS } from '../../config/theme';
import { printPdfFile, sharePdfFile } from '../../utils/pdfSharePrint';

interface PdfFile {
  name: string;
  url: string;
  lastModified: string;
  isDownloaded?: boolean;
  localPath?: string;
}

export const PdfList: React.FC = () => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [filteredPdfs, setFilteredPdfs] = useState<PdfFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    try {
      const files = await PDFService.listPdfs();
      setPdfs(files);
      setFilteredPdfs(files);
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = async (pdf: PdfFile) => {
    try {
      setDownloading(pdf.name);

      if (pdf.isDownloaded && pdf.localPath) {
        const filePath = pdf.localPath.replace('file://', '');
        const exists = await RNFS.exists(filePath);

        if (exists) {
          navigation.navigate('PdfViewer', { uri: pdf.localPath, title: pdf.name });
          return;
        } else {
          const updatedFiles = await PDFService.listPdfs();
          setPdfs(updatedFiles);
          setFilteredPdfs(updatedFiles.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          throw new Error('Arquivo local não encontrado');
        }
      }

      if (!isOffline) {
        const localPath = await PDFService.downloadPdf(pdf);
        const updatedFiles = await PDFService.listPdfs();
        setPdfs(updatedFiles);
        setFilteredPdfs(updatedFiles.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        if (localPath) {
          navigation.navigate('PdfViewer', { uri: localPath, title: pdf.name });
        }
      }
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
    } finally {
      setDownloading(null);
    }
  };

  const sharePdf = (pdf: PdfFile) => {
    void sharePdfFile(pdf.name, pdf.localPath);
  };

  const printPdf = (pdf: PdfFile) => {
    void printPdfFile(pdf.name, pdf.localPath);
  };

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredPdfs(pdfs.filter(pdf =>
      pdf.name.toLowerCase().includes(query.toLowerCase())
    ));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Icon name="cloud-off" size={18} color={APP_COLORS.primaryTextOnPrimary} />
          <Text style={styles.offlineText}>
            Modo Offline, só os FDS baixados estão disponíveis.
          </Text>
        </View>
      )}

      <Searchbar
        placeholder="Busque por nome ou número..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={APP_COLORS.secondary}
      />

      <FlatList
        data={filteredPdfs}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const disabled = !item.isDownloaded && isOffline;
          const isDownloading = downloading === item.name;

          return (
            <TouchableOpacity
              style={[styles.card, disabled && styles.cardDisabled]}
              onPress={() => openPdf(item)}
              disabled={disabled}
              activeOpacity={0.85}
            >
              {/* Linha 1: ícone | título | ícone impressora ou download */}
              <View style={styles.row1}>
                <Icon
                  name="picture-as-pdf"
                  size={24}
                  color={item.isDownloaded ? APP_COLORS.secondary : APP_COLORS.textDisabled}
                />
                <Text style={[styles.title, disabled && styles.titleDisabled]} numberOfLines={2}>
                  {item.name.replace('.pdf', '')}
                </Text>
                {isDownloading ? (
                  <ActivityIndicator size="small" color={APP_COLORS.secondary} />
                ) : item.isDownloaded ? (
                  <TouchableOpacity
                    onPress={() => printPdf(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="print" size={22} color={APP_COLORS.secondary} />
                  </TouchableOpacity>
                ) : (
                  <Icon name="download" size={22} color={APP_COLORS.secondary} />
                )}
              </View>

              {/* Linha 2: só aparece se já estiver baixado */}
              {item.isDownloaded && (
                <View style={styles.row2}>
                  <TouchableOpacity style={styles.btnCompartilhar} onPress={() => sharePdf(item)}>
                    <Text style={styles.btnCompartilharText}>Enviar</Text>
                  </TouchableOpacity>

                  <View style={styles.offlineTag}>
                    <Icon name="check-circle" size={13} color={APP_COLORS.success} />
                    <Text style={styles.offlineTagText}>FDS/FISPQ disponível offline</Text>
                  </View>

                  <TouchableOpacity style={styles.btnImprimir} onPress={() => printPdf(item)}>
                    <Text style={styles.btnImprimirText}>Imprimir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhum PDF encontrado nessa pesquisa.'
                : 'Nenhum PDF encontrado. Verifique sua conexão ou contate o desenvolvedor.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchBar: {
    margin: 5,
    elevation: 4,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
  },
  offlineBanner: {
    backgroundColor: APP_COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineText: {
    color: APP_COLORS.primaryTextOnPrimary,
    fontSize: 13,
    flex: 1,
  },

  // Card
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
    marginHorizontal: 5,
    marginBottom: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  cardDisabled: {
    opacity: 0.5,
  },

  // Linha 1
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: APP_COLORS.textPrimary,
  },
  titleDisabled: {
    color: APP_COLORS.textDisabled,
  },

  // Linha 2
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: APP_COLORS.divider,
  },
  btnCompartilhar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRightWidth: 0.5,
    borderRightColor: APP_COLORS.divider,
  },
  btnCompartilharText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    fontWeight: '500',
  },
  offlineTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 4,
  },
  offlineTagText: {
    fontSize: 11,
    color: APP_COLORS.success,
    flexShrink: 1,
  },
  btnImprimir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderLeftWidth: 0.5,
    borderLeftColor: APP_COLORS.divider,
  },
  btnImprimirText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
  },
});