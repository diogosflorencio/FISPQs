import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  RefreshControl,
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
import { displayPdfTitle, parseFileName } from '../../utils/parseFileName';
import {
  buildGroupedRows,
  buildListSections,
  collectDocTypes,
  filterPdfFiles,
  isListFiltered,
  type PdfListRow,
} from '../../utils/groupPdfFiles';
import {
  loadFavorites,
  saveFavorites,
  toggleFavoriteSync,
} from '../../services/favoritesService';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAV_LOADING_DELAY_MS = 280;

const FAV_ANIM = LayoutAnimation.create(
  220,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

interface PdfFile {
  name: string;
  url: string;
  lastModified: string;
  isDownloaded?: boolean;
  localPath?: string;
}

export const PdfList: React.FC = () => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [favoriteToggling, setFavoriteToggling] = useState<string | null>(null);
  const favoriteToggleBusy = useRef(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const loadPdfs = useCallback(async (options?: { silent?: boolean }) => {
    try {
      const [files, favs] = await Promise.all([PDFService.listPdfs(), loadFavorites()]);
      setPdfs(files);
      setFavorites(favs);
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadPdfs({ silent: true });
  }, [loadPdfs]);

  const filtering = isListFiltered(searchQuery, filterType);

  const docTypes = useMemo(() => collectDocTypes(pdfs), [pdfs]);

  const { favoriteFiles, listSections } = useMemo(
    () => buildListSections(pdfs, favorites, searchQuery, filterType),
    [pdfs, searchQuery, filterType, favorites],
  );

  const groupedRows = useMemo(
    () => buildGroupedRows(listSections),
    [listSections],
  );

  const searchResults = useMemo((): PdfFile[] => {
    if (!filtering) return [];
    return filterPdfFiles(pdfs, searchQuery, filterType).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );
  }, [pdfs, searchQuery, filterType, filtering]);

  const listData = useMemo((): PdfListRow<PdfFile>[] => {
    if (filtering) {
      return searchResults.map(file => ({ kind: 'file', id: file.name, file }));
    }
    return groupedRows;
  }, [filtering, searchResults, groupedRows]);

  useEffect(() => {
    void loadPdfs();
  }, [loadPdfs]);

  const totalVisible = useMemo(() => listData.filter(r => r.kind === 'file').length, [listData]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType(null);
  }, []);

  const refreshList = useCallback(async () => {
    const updatedFiles = await PDFService.listPdfs();
    setPdfs(updatedFiles);
  }, []);

  const openPdf = async (pdf: PdfFile) => {
    try {
      setDownloading(pdf.name);

      if (pdf.isDownloaded && pdf.localPath) {
        const filePath = (pdf.localPath ?? '').replace('file://', '');
        const exists = await RNFS.exists(filePath);

        if (exists) {
          navigation.navigate('PdfViewer', { uri: pdf.localPath, title: pdf.name });
          return;
        }

        await refreshList();
        throw new Error('Arquivo local não encontrado');
      }

      if (!isOffline) {
        const localPath = await PDFService.downloadPdf(pdf);
        await refreshList();
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

  const onToggleFavorite = useCallback(async (name: string) => {
    if (favoriteToggleBusy.current) return;
    favoriteToggleBusy.current = true;

    let before = new Set<string>();
    let after = new Set<string>();
    let showLoading = false;

    const loadingTimer = setTimeout(() => {
      showLoading = true;
      setFavoriteToggling(name);
    }, FAV_LOADING_DELAY_MS);

    setFavorites(prev => {
      before = new Set(prev);
      after = toggleFavoriteSync(name, prev);
      return after;
    });

    LayoutAnimation.configureNext(FAV_ANIM);

    try {
      await saveFavorites(after);
    } catch {
      LayoutAnimation.configureNext(FAV_ANIM);
      setFavorites(before);
    } finally {
      clearTimeout(loadingTimer);
      if (showLoading) {
        setFavoriteToggling(null);
      }
      favoriteToggleBusy.current = false;
    }
  }, []);

  const renderPdfCard = useCallback(
    (item: PdfFile, showMetaInRow: boolean, cardStyle?: object | object[]) => {
      if (!item?.name) return null;

      const disabled = !item.isDownloaded && isOffline;
      const isDownloading = downloading === item.name;
      const isFavorite = favorites.has(item.name);
      const isTogglingFavorite = favoriteToggling === item.name;
      const parsed = parseFileName(item.name);
      const title = displayPdfTitle(item.name);

      return (
        <TouchableOpacity
          key={item.name}
          style={[styles.card, cardStyle, disabled && styles.cardDisabled]}
          onPress={() => openPdf(item)}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <View style={styles.row1}>
            <Icon
              name="picture-as-pdf"
              size={24}
              color={item.isDownloaded ? APP_COLORS.secondary : APP_COLORS.textDisabled}
            />
            <View style={styles.titleBlock}>
              <Text style={[styles.title, disabled && styles.titleDisabled]} numberOfLines={2}>
                {title}
              </Text>
              {parsed.isValid && showMetaInRow && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {parsed.contractType} · {parsed.docType}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => void onToggleFavorite(item.name)}
              disabled={isTogglingFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.starBtn,
                pressed && !isTogglingFavorite && styles.starBtnPressed,
              ]}
            >
              {isTogglingFavorite ? (
                <ActivityIndicator size={20} color={APP_COLORS.warning} />
              ) : (
                <Icon
                  name={isFavorite ? 'star' : 'star-border'}
                  size={24}
                  color={isFavorite ? APP_COLORS.warning : APP_COLORS.textMuted}
                />
              )}
            </Pressable>
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
    },
    [downloading, favoriteToggling, favorites, isOffline, onToggleFavorite],
  );

  const showTypeChips = docTypes.length > 0 && !searchQuery.trim();

  const favoritesBlock = useMemo(() => {
    if (filtering || favoriteFiles.length === 0) return null;

    return (
      <View style={styles.favoritesBox}>
        <View style={styles.favoritesBoxLabel}>
          <Icon name="star" size={15} color={APP_COLORS.warning} />
          <Text style={styles.favoritesBoxLabelText}>Favoritos</Text>
        </View>
        {favoriteFiles.map((file, index) =>
          renderPdfCard(
            file,
            true,
            [
              styles.cardInFavorites,
              index === favoriteFiles.length - 1 && styles.cardLastInFavorites,
            ],
          ),
        )}
      </View>
    );
  }, [favoriteFiles, filtering, renderPdfCard]);

  const topHeader = useMemo(
    () => (
      <View style={styles.listTop}>
        <Searchbar
          placeholder="Busque por contrato, tipo ou documento..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={APP_COLORS.secondary}
        />

        {showTypeChips && (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, !filterType && styles.filterChipActive]}
              onPress={() => setFilterType(null)}
            >
              <Text style={[styles.filterChipText, !filterType && styles.filterChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {docTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                onPress={() => setFilterType(prev => (prev === type ? null : type))}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === type && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {filtering && (
          <View style={styles.filterBanner}>
            <Text style={styles.filterBannerText}>
              {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
              {filterType ? ` · ${filterType}` : ''}
            </Text>
            <TouchableOpacity
              onPress={clearFilters}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.filterBannerClear}>Limpar</Text>
            </TouchableOpacity>
          </View>
        )}

        {favoritesBlock}
      </View>
    ),
    [
      searchQuery,
      showTypeChips,
      docTypes,
      filterType,
      filtering,
      searchResults.length,
      favoritesBlock,
      clearFilters,
    ],
  );

  const renderListRow = ({ item, index }: { item: PdfListRow<PdfFile>; index: number }) => {
    if (item.kind === 'header') {
      if (item.showContractTitle) {
        return (
          <View style={[styles.groupHeader, index === 0 && styles.groupHeaderFirst]}>
            <Text style={styles.groupHeaderTitle}>{item.contractType}</Text>
            {item.docType ? (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.docType}</Text>
              </View>
            ) : null}
          </View>
        );
      }

      return (
        <View style={styles.groupSubheader}>
          {item.docType ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.docType}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    return renderPdfCard(item.file, filtering, styles.cardTight);
  };

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_COLORS.secondary]} />
  );

  const emptyMessage = (
    <View style={styles.emptySearch}>
      <Text style={styles.emptyText}>
        {filtering
          ? 'Nenhum PDF encontrado nessa pesquisa.'
          : 'Nenhum PDF encontrado. Verifique sua conexão ou contate o desenvolvedor.'}
      </Text>
    </View>
  );

  if (loading && pdfs.length === 0) {
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

      <FlatList
        style={styles.listFlex}
        data={listData}
        keyExtractor={row => row.id}
        renderItem={renderListRow}
        ListHeaderComponent={topHeader}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={totalVisible === 0 ? styles.emptySearchList : styles.groupListContent}
        ListEmptyComponent={totalVisible === 0 ? emptyMessage : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  listFlex: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyList: {
    paddingTop: 24,
  },
  groupListContent: {
    paddingBottom: 8,
  },
  emptySearchList: {
    paddingTop: 24,
  },
  emptySearch: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  listTop: {
    paddingHorizontal: 5,
    paddingTop: 4,
    paddingBottom: 0,
  },
  searchBar: {
    height: 42,
    margin: 0,
    elevation: 2,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
  },
  searchInput: {
    minHeight: 0,
    height: 42,
    paddingVertical: 0,
    fontSize: 14,
  },
  filterScroll: {
    height: 32,
    flexGrow: 0,
    marginTop: 4,
    marginBottom: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 0,
    height: 28,
    justifyContent: 'center',
    borderRadius: 1,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 0.5,
    borderColor: APP_COLORS.border,
  },
  filterChipActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: APP_COLORS.primaryTextOnPrimary,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 0.5,
    borderColor: APP_COLORS.border,
  },
  filterBannerText: {
    fontSize: 13,
    color: APP_COLORS.textSecondary,
    flex: 1,
  },
  filterBannerClear: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.secondary,
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
  favoritesBox: {
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: APP_COLORS.warning,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  favoritesBoxLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    backgroundColor: APP_COLORS.background,
  },
  favoritesBoxLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.warning,
    letterSpacing: 0.3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 5,
    paddingTop: 6,
    paddingBottom: 0,
    backgroundColor: APP_COLORS.background,
  },
  groupHeaderFirst: {
    paddingTop: 2,
  },
  groupSubheader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 5,
    paddingTop: 10,
    paddingBottom: 0,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_COLORS.divider,
    backgroundColor: APP_COLORS.background,
  },
  groupHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.primary,
    flex: 1,
  },
  cardTight: {
    marginHorizontal: 5,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#E6F1FB',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0C447C',
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
    marginHorizontal: 5,
    marginBottom: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardInFavorites: {
    marginHorizontal: 0,
  },
  cardLastInFavorites: {
    marginBottom: 0,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  starBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  starBtnPressed: {
    opacity: 0.55,
    transform: [{ scale: 0.88 }],
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    color: APP_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  titleDisabled: {
    color: APP_COLORS.textDisabled,
  },
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
