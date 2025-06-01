import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const AboutScreen: React.FC = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:diogosflorencio@gmail.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="info" size={50} color="#004000" />
        <Text style={styles.headerTitle}>FISPQs - Meio Ambiente</Text>
        <Text style={styles.version}>Versão 1.1.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Versões</Text>
        
        {/* Versão Atual */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="new-releases" size={20} color="#004000" /> Versão 1.1.0
          </Text>
          <Text style={styles.versionDate}>Lançamento: Março/2024</Text>
          <Text style={styles.versionText}>
            Adições:{'\n'}
            • Navegação entre páginas com Bottom Tab Navigation{'\n'}
            • Nova tela de Tutorial com guia completo de uso{'\n'}
            • Tela Sobre com histórico de versões{'\n'}
            • Paginação na visualização de PDFs{'\n'}
            • Remoção automática da extensão ".pdf" nos títulos{'\n'}
            • Melhorias na interface do usuário{'\n'}
            • Otimização no sistema de cache
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Implementação do React Navigation 6.x{'\n'}
            • Refatoração da estrutura de componentes{'\n'}
            • Organização em módulos independentes{'\n'}
            • Melhorias na gestão de estado
          </Text>
        </View>

        {/* Versão Inicial */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="history" size={20} color="#004000" /> Versão 1.0.0-natalia
          </Text>
          <Text style={styles.versionDate}>Lançamento: Janeiro/2024</Text>
          <Text style={styles.versionText}>
            Concepção inicial do projeto, idealizado por Natalia:{'\n'}
            • Listagem básica de FISPQs{'\n'}
            • Visualização de documentos PDF{'\n'}
            • Sistema de download para uso offline{'\n'}
            • Busca por nome de arquivo{'\n'}
            • Indicador de disponibilidade offline
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Integração com Firebase Storage{'\n'}
            • Sistema de cache local{'\n'}
            • Gestão de estado com React Hooks{'\n'}
            • Implementação do react-native-pdf
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Desenvolvido por Diogo Florêncio
        </Text>
        <Text style={styles.email} onPress={handleEmailPress}>
          diogosflorencio@gmail.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004000',
    marginTop: 12,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004000',
    marginBottom: 16,
  },
  versionBlock: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004000',
    marginBottom: 4,
  },
  versionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  versionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  versionDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 6,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#004000',
    textDecorationLine: 'underline',
  },
}); 