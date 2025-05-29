import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Divider, Card } from 'react-native-paper';

const APP_VERSION = '1.0.0';

const AboutScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Sobre o App</Text>
          <Text style={styles.subtitle}>Desenvolvido por Diogo para Natalia =)</Text>
          <Divider style={styles.divider} />
          <Text style={styles.version}>Versão: {APP_VERSION}</Text>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Como usar o aplicativo:</Text>
          <Text style={styles.tutorial}>
            1. Toque em "Baixar" para salvar um PDF do servidor no seu dispositivo. {'\n'}
            2. PDFs baixados ficam disponíveis mesmo offline. {'\n'}
            3. Use a barra de busca para encontrar rapidamente uma FISPQ pelo nome. {'\n'}
            4. Toque em um PDF baixado para visualizar seu conteúdo. {'\n'}
            5. Use os filtros para ver todos, apenas baixados ou apenas disponíveis para download. {'\n'}
          </Text>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Funcionamento:</Text>
          <Text style={styles.tutorial}>
            - O app conecta ao Supabase Storage para listar e baixar FISPQs. {'\n'}
            - PDFs baixados ficam salvos localmente e podem ser acessados offline. {'\n'}
            - Você pode atualizar a lista puxando para baixo (pull-to-refresh). {'\n'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F6F7FB',
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#fff',
    padding: 8,
  },
  title: {
    color: '#6C47FF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#6C47FF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tutorial: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 10,
  },
});

export default AboutScreen;