import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PDFService from '../../services/PdfService';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERT_DISMISSED_KEY = '@tutorial_alert_dismissed';

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
  const [showAlert, setShowAlert] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkAlertStatus();
  }, []);

  const checkAlertStatus = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(ALERT_DISMISSED_KEY);
      if (dismissed === null) {
        setShowAlert(true);
      }
    } catch (error) {
      setShowAlert(true);
    }
  };

  const handleDismissAlert = async () => {
    try {
      await AsyncStorage.setItem(ALERT_DISMISSED_KEY, 'true');
      setShowAlert(false);
    } catch (error) {
      setShowAlert(false);
    }
  };

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
        <ActivityIndicator size="large" color="APP_COLORS.secondary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Icon name="cloud-off" size={20} color="#fff" />
          <Text style={styles.offlineText}>Modo Offline - Você está sem internet. Os FDS baixados estão disponíveis.</Text>
        </View>
      )}
      {/* {showAlert && (
        <TouchableOpacity 
          style={styles.alertContainer}
          onPress={() => setIsAlertExpanded(!isAlertExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.alertHeader}>
            <Icon name="warning" size={20} color="#FF9800" />
            <Text style={styles.alertTitle}>Atualização de Segurança!!</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleDismissAlert();
              }} 
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.alertText} numberOfLines={isAlertExpanded ? undefined : 1}>
            O app passou por uma atualização urgente de segurança exigida pelo Google Play.
            {'\n\n'}
            Em <Text style={styles.alertBold}>10 de setembro de 2025</Text>, o Google enviou um alerta crítico exigindo que o app aceitasse páginas de 16 KB de memória. Sem essa atualização, o app <Text style={styles.alertBold}>pararia de funcionar a partir de 31 de outubro de 2025</Text>.
            {'\n\n'}
            A versão <Text style={styles.alertBold}>1.1.2 - segurança</Text> foi lançada para atender essas exigências e garantir que o app continue funcionando normalmente.
            {'\n'}
            (toque no x pra excluir essa mensagem)
            {'\n\n'}
            <Text 
              style={styles.alertLink}
              onPress={() => Linking.openURL('https://developer.android.com/guide/practices/page-sizes#build')}
            >
              Caso queira saber mais sobre esse negocio de páginas de 16 KB, toque aqui! (tá tudo em inglês)
            </Text>
          </Text>
          {!isAlertExpanded && (
            <View style={styles.expandIndicator}>
              <Text style={styles.expandText}>Toque para expandir a mensagem</Text>
              <Icon name="expand-more" size={16} color="#856404" />
            </View>
          )}
        </TouchableOpacity>
      )} */}
      <Searchbar
        placeholder="Busque por nome ou número..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={[styles.searchBar, showAlert && styles.searchBarWithAlert]}
        iconColor="APP_COLORS.secondary"
      />
      <FlatList
        data={filteredPdfs}
        keyExtractor={(item) => item.name}
        // refreshControl={
        //   <RefreshControl 
        //     refreshing={refreshing} 
        //     onRefresh={onRefresh}
        //     colors={['APP_COLORS.secondary']}
        //     enabled={!isOffline}
        //   />
        // }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              (!item.isDownloaded && isOffline) && styles.itemDisabled
            ]}
            onPress={() => openPdf(item)}
            disabled={!item.isDownloaded && isOffline}
          >
            <Icon name="picture-as-pdf" size={24} color="APP_COLORS.secondary" />
            <View style={styles.textContainer}>
              <Text style={[
                styles.title,
                (!item.isDownloaded && isOffline) && styles.textDisabled
              ]}>{item.name.replace('.pdf', '')}</Text> 
              {/* listo nome sem o.pdf */}
              {item.isDownloaded && (
                <>
                <Text style={styles.downloadedText}>
                  <Icon name="check-circle" size={14} color="#4CAF50" /> Este FDS/FISPQ está disponível offline =)
                </Text>
                <Text style={styles.printText}><Icon name="print" size={14} color="APP_COLORS.secondary" /> Imprimir</Text>
                </>
              )}
            </View>
            {downloading === item.name ? (
              <ActivityIndicator size="small" color="APP_COLORS.secondary" />
            ) : (
              <Icon 
                name={item.isDownloaded ? "check" : "download"} 
                size={24} 
                color={item.isDownloaded ? "#4CAF50" : "APP_COLORS.secondary"} 
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
      {/* <Text style={{
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15
      }}>
        Versão beta 1.1.0-paginas
      </Text> */}
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
  searchBarWithAlert: {
    marginTop: 0,
    marginBottom: 16,
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
  printText: {
    fontSize: 12,
    color: 'APP_COLORS.secondary',
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
  alertContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  alertBold: {
    fontWeight: 'bold',
    color: '#856404',
  },
  alertLink: {
    color: '#003A8C',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  expandText: {
    fontSize: 12,
    color: '#856404',
    marginRight: 4,
  },
}); 