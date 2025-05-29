import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Appbar } from 'react-native-paper';
import PDFService, { PDFDocument } from '../../services/PDFService';

const HomeScreen: React.FC = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await PDFService.listAllPDFs();
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="FISPQs" />
      </Appbar.Header>
      
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {documents.length === 0 ? (
            <View style={styles.centerContent}>
              <Text>Nenhum documento encontrado</Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} style={styles.docItem}>
                <Text variant="titleMedium">{doc.title}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  docItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
});

export default HomeScreen;