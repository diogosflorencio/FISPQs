import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const TutorialScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="info" size={24} color="#004000" />
          <Text style={styles.title}>O que é o App?</Text>
        </View>
        <Text style={styles.text}>
          Este é um aplicativo desenvolvido para facilitar o acesso às Fichas de Informação de Segurança de Produtos Químicos (FISPQs) do setor de Meio Ambiente.
          Com ele, você pode consultar as FISPQs tanto online quanto offline, garantindo acesso rápido às informações de segurança quando necessário.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="search" size={24} color="#004000" />
          <Text style={styles.title}>Como Buscar FISPQs</Text>
        </View>
        <Text style={styles.text}>
          • Use a barra de pesquisa para buscar por nome ou número do produto{'\n'}
          • A busca é instantânea e não diferencia maiúsculas de minúsculas{'\n'}
          • Os resultados são filtrados conforme você digita
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="cloud-download" size={24} color="#004000" />
          <Text style={styles.title}>Modo Offline</Text>
        </View>
        <Text style={styles.text}>
          • As FISPQs são baixadas automaticamente ao serem visualizadas{'\n'}
          • Um ícone verde ✓ indica que a FISPQ está disponível offline{'\n'}
          • Você pode acessar FISPQs baixadas mesmo sem internet{'\n'}
          • O app sincroniza automaticamente quando há conexão
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="storage" size={24} color="#004000" />
          <Text style={styles.title}>Aspectos Técnicos</Text>
        </View>
        <Text style={styles.text}>
          • Os arquivos são armazenados no Supabase (usando plano free pq é osso){'\n'}
          • Sincronização automática com o banco de dados em nuvem{'\n'}
          • Cache local para acesso offline{'\n'}
          • Compressão de dados para economia de espaço{'\n'}
          • Sistema de versionamento de documentos
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="sync" size={24} color="#004000" />
          <Text style={styles.title}>Atualizações</Text>
        </View>
        <Text style={styles.text}>
          • Puxe a tela para baixo para sincronizar manualmente{'\n'}
          • Novas FISPQs são adicionadas automaticamente{'\n'}
          • Atualizações de documentos são sincronizadas{'\n'}
          • Versões antigas são mantidas em cache até a próxima sincronização
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="help" size={24} color="#004000" />
          <Text style={styles.title}>Suporte</Text>
        </View>
        <Text style={styles.text}>
          Em caso de problemas ou dúvidas:{'\n'}
          • Verifique sua conexão com a internet{'\n'}
          • Tente sincronizar manualmente{'\n'}
          • Entre em contato: diogosflorencio@gmail.com
        </Text>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.version}>Versão 1.1.0-paginas</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004000',
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  version: {
    fontSize: 12,
    color: '#666',
  },
});

