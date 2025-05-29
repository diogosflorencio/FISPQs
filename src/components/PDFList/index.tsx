


import { FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { PDFDocument } from '../../services/PDFService';


type PDFListProps = {
  documents: PDFDocument[];
  onDocumentPress: (doc: PDFDocument) => void;
  onDownloadPress?: (doc: PDFDocument) => void;
  downloadingId?: string | null;
};

const PDFList: React.FC<PDFListProps> = ({ documents, onDocumentPress, onDownloadPress, downloadingId }) => {
  return (
    <FlatList
      data={documents}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isRemote = item.source === 'assets';
        const isDownloading = downloadingId === item.id;
        return (
          <Card style={styles.card}>
            <TouchableOpacity
              onPress={() => !isRemote && onDocumentPress(item)}
              disabled={isRemote}
              style={{ flex: 1 }}
            >
              <Card.Content>
                <Text variant="titleMedium">{item.title}</Text>
                {item.date && (
                  <Text variant="labelSmall" style={styles.date}>{item.date}</Text>
                )}
              </Card.Content>
            </TouchableOpacity>
            {isRemote && (
              <View style={styles.downloadContainer}>
                <Button
                  mode="contained"
                  buttonColor="#6C47FF"
                  textColor="#fff"
                  style={styles.downloadBtn}
                  onPress={() => onDownloadPress && onDownloadPress(item)}
                  disabled={isDownloading}
                  icon={isDownloading ? undefined : (props => (
                    <MaterialIcons name="download" size={20} color="#fff" />
                  ))}
                >
                  {isDownloading ? <ActivityIndicator color="#fff" size={18} /> : 'Baixar'}
                </Button>
              </View>
            )}
          </Card>
        );
      }}
      ListEmptyComponent={<View style={styles.empty}><Text>Nenhum documento encontrado.</Text></View>}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  date: {
    marginTop: 4,
    opacity: 0.6,
    color: '#6C47FF',
    fontWeight: 'bold',
  },
  downloadContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
  },
  downloadBtn: {
    borderRadius: 20,
    paddingHorizontal: 8,
    minWidth: 90,
    elevation: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 32,
  },
});

export default PDFList;
