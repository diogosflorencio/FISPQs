import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PDFService from '../services/PdfService';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';

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
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    if (isOffline) {
      return;
    }
    setRefreshing(true);
    try {
      await PDFService.syncPdfs();
      await loadPdfs();
    } catch (error) {
      console.error('Erro ao sincronizar PDFs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openPdf = async (pdf: PdfFile) => {
    try {
      setDownloading(pdf.name);
      
      // Se já estiver baixado, tenta abrir diretamente
      if (pdf.isDownloaded && pdf.localPath) {
        const filePath = pdf.localPath.replace('file://', '');
        const exists = await RNFS.exists(filePath);
        
        if (exists) {
          console.log('Abrindo PDF local:', pdf.localPath);
          navigation.navigate('PdfViewer', {
            uri: pdf.localPath,
            title: pdf.name
          });
          setDownloading(null);
          return;
        } else {
          // Se o arquivo não existe mais, atualiza o status
          const updatedFiles = await PDFService.listPdfs();
          setPdfs(updatedFiles);
          setFilteredPdfs(updatedFiles.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          throw new Error('Arquivo local não encontrado');
        }
      }

      // Se não estiver offline, tenta baixar
      if (!isOffline) {
        const localPath = await PDFService.downloadPdf(pdf);
        
        // Atualiza a lista de PDFs para refletir o novo download
        const updatedFiles = await PDFService.listPdfs();
        setPdfs(updatedFiles);
        setFilteredPdfs(updatedFiles.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));

        if (localPath) {
          navigation.navigate('PdfViewer', {
            uri: localPath,
            title: pdf.name
          });
        }
      }
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
    } finally {
      setDownloading(null);
    }
  };

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = pdfs.filter(pdf => 
      pdf.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPdfs(filtered);
  };

  useEffect(() => {
    loadPdfs();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Icon name="cloud-off" size={20} color="#fff" />
          <Text style={styles.offlineText}>Modo Offline - Você está sem internet. Os FISPQs baixados estão disponíveis.</Text>
        </View>
      )}
      <Searchbar
        placeholder="Busque por nome ou número..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#6C47FF"
      />
      <FlatList
        data={filteredPdfs}
        keyExtractor={(item) => item.name}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6C47FF']}
            enabled={!isOffline}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              (!item.isDownloaded && isOffline) && styles.itemDisabled
            ]}
            onPress={() => openPdf(item)}
            disabled={!item.isDownloaded && isOffline}
          >
            <Icon name="picture-as-pdf" size={24} color="#6C47FF" />
            <View style={styles.textContainer}>
              <Text style={[
                styles.title,
                (!item.isDownloaded && isOffline) && styles.textDisabled
              ]}>{item.name}</Text>
              {item.isDownloaded && (
                <Text style={styles.downloadedText}>
                  <Icon name="check-circle" size={14} color="#4CAF50" /> Está FISPQ está disponível offline
                </Text>
              )}
            </View>
            {downloading === item.name ? (
              <ActivityIndicator size="small" color="#6C47FF" />
            ) : (
              <Icon 
                name={item.isDownloaded ? "check" : "download"} 
                size={24} 
                color={item.isDownloaded ? "#4CAF50" : "#6C47FF"} 
              />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum PDF encontrado nessa pesquisa' : 'Nenhum PDF encontrado. Verifique sua conexão com a internet ou contate o desenvolvedor (diogosflorencio@gmail.com).'}
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
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  downloadedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  textDisabled: {
    color: '#999',
  },
}); 