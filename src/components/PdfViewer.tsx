import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text, BackHandler } from 'react-native';
import Pdf from 'react-native-pdf';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import RNFS from 'react-native-fs';

type Props = NativeStackScreenProps<RootStackParamList, 'PdfViewer'>;

export const PdfViewer: React.FC<Props> = ({ route, navigation }) => {
  const { uri, title } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Verifica se o arquivo existe antes de tentar carregar
    const checkFile = async () => {
      try {
        const exists = await RNFS.exists(uri.replace('file://', ''));
        if (!exists) {
          setError('Arquivo PDF não encontrado no dispositivo');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erro ao verificar arquivo:', err);
        setError('Erro ao verificar arquivo PDF');
        setIsLoading(false);
      }
    };
    checkFile();

    // Configura o botão de voltar para limpar o estado
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [uri, navigation]);

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar o PDF:</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : (
        <>
          <Pdf
            source={{ uri }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`PDF carregado: ${filePath} com ${numberOfPages} páginas`);
              setIsLoading(false);
              setError(null);
              setTotalPages(numberOfPages);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Página atual: ${page}/${numberOfPages}`);
              setCurrentPage(page);
              //setTotalPages(numberOfPages); // adiciona o total de páginas
            }}
            onError={(error) => {
              console.error('Erro ao carregar PDF:', error);
              setError(error.toString());
              setIsLoading(false);
            }}
            onLoadProgress={(percentage) => {
              console.log('Carregando:', percentage);
              if (percentage === 1) {
                setIsLoading(false);
              }
            }}
            enablePaging={true}
            enableAnnotationRendering={true}
            trustAllCerts={false}
            spacing={0}
            fitPolicy={0}
            minScale={1.0}
            maxScale={3.0}
          />
          {/* {isLoading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#6C47FF" />
              <Text style={styles.loadingText}>Carregando PDF...</Text>
            </View>
          )} */}
          {!error && (
            <View style={styles.pageInfo}>
              <Text style={styles.pageText}>
                Página {currentPage} de {totalPages} (em desenvolvimento)
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#ffff',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 26, 32, 0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  pageInfo: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    paddingVertical: 8,
  },
  pageText: {
    color: '#fff',
    fontSize: 14,
  },
}); 