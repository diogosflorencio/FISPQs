import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../config/theme';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERT_DISMISSED_KEY = '@tutorial_alert_dismissed';

export const TutorialScreen: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);

  // useEffect(() => {
  //   checkAlertStatus();
  // }, []);

  // const checkAlertStatus = async () => {
  //   try {
  //     const dismissed = await AsyncStorage.getItem(ALERT_DISMISSED_KEY);
  //     if (dismissed === null) {
  //       setShowAlert(true);
  //     }
  //   } catch (error) {
  //     // Se houver erro, mostra o alerta por segurança
  //     setShowAlert(true);
  //   }
  // };

  // const handleDismissAlert = async () => {
  //   try {
  //     await AsyncStorage.setItem(ALERT_DISMISSED_KEY, 'true');
  //     setShowAlert(false);
  //   } catch (error) {
  //     setShowAlert(false);
  //   }
  // };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container}>
      {showAlert && (
        <TouchableOpacity 
          style={styles.alertContainer}
          onPress={() => setIsAlertExpanded(!isAlertExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.alertHeader}>
            <Icon name="warning" size={20} color={APP_COLORS.warning} />
            <Text style={styles.alertTitle}>Atualização Urgente de Segurança</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                // handleDismissAlert();
              }} 
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color={APP_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.alertText} numberOfLines={isAlertExpanded ? undefined : 3}>
            O app passou por uma atualização urgente de segurança exigida pelo Google Play.
            {'\n\n'}
            Em <Text style={styles.alertBold}>10 de setembro de 2025</Text>, o Google enviou um alerta crítico exigindo que o app aceitasse páginas de 16 KB de memória. Sem essa atualização, o app <Text style={styles.alertBold}>pararia de funcionar a partir de 31 de outubro de 2025</Text>.
            {'\n\n'}
            A versão <Text style={styles.alertBold}>1.1.2 - segurança</Text> foi lançada para atender essas exigências e garantir que o app continue funcionando normalmente.
            {'\n\n'}
            <Text 
              style={styles.alertLink}
              onPress={() => Linking.openURL('https://developer.android.com/guide/practices/page-sizes#build')}
            >
              Saiba mais sobre o suporte a páginas de 16 KB →
            </Text>
          </Text>
          {!isAlertExpanded && (
            <View style={styles.expandIndicator}>
              <Text style={styles.expandText}>Toque para expandir</Text>
              <Icon name="expand-more" size={16} color={APP_COLORS.warningText} />
            </View>
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="info" size={24} color={APP_COLORS.primary} />
          <Text style={styles.title}>O que é?</Text>
        </View>
        <Text style={styles.text}>
          Este app foi desenvolvido para facilitar o acesso às Fichas de Informação de Segurança de Produtos Químicos (FISPQs ou FDS) do setor de Meio Ambiente. 
          {'\n'}
          {'\n'}
          Ele te possibilita acessar os FISPQs/FDS tanto online quanto offline, garantindo rápido acesso às informações de segurança quando necessário.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="search" size={24} color={APP_COLORS.primary} />
          <Text style={styles.title}>Como buscar os FISPQs/FDS</Text>
        </View>
        <Text style={styles.text}>
          • Use a barra de pesquisa para buscar por nome ou número do produto{'\n'}
          • A busca é instantânea e não diferencia maiúsculas de minúsculas{'\n'}
          • Os resultados são filtrados conforme você digita
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="cloud-download" size={24} color={APP_COLORS.primary} />
          <Text style={styles.title}>Modo Offline</Text>
        </View>
        <Text style={styles.text}>
          • Os FDS/FISPQs são baixadas automaticamente ao serem visualizadas (basta clicar){'\n'}
          • Um ícone verde ✓ indica que a FISPQ está disponível offline{'\n'}
          • Você pode acessar FISPQs baixadas mesmo sem internet{'\n'}
          • O app sincroniza automaticamente quando há conexão (requisita ao servidor mais documentos, caso haja)
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Icon name="storage" size={24} color={APP_COLORS.primary} />
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
          <Icon name="sync" size={24} color={APP_COLORS.primary} />
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
          <Icon name="help" size={24} color={APP_COLORS.primary} />
          <Text style={styles.title}>Suporte</Text>
        </View>
        <Text style={styles.text}>
          Em caso de problemas ou dúvidas:{'\n'}
          • Verifique sua conexão com a internet{'\n'}
          • Tente sincronizar manualmente{'\n'}
          • Entre em contato em qualquer caso e a qualquer momento: diogosflorencio@gmail.com
        </Text>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.version}>Versão 1.1.2 - segurança</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    padding: 16,
  },
  section: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
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
    color: APP_COLORS.primary,
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: APP_COLORS.textPrimary,
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom:32,
  },
  version: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
  },
  alertContainer: {
    backgroundColor: APP_COLORS.warningSurface,
    borderRadius: 1,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.warningBorder,
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
    color: APP_COLORS.warningText,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: APP_COLORS.warningText,
    lineHeight: 20,
  },
  alertBold: {
    fontWeight: 'bold',
    color: APP_COLORS.warningText,
  },
  alertLink: {
    color: APP_COLORS.primary,
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
    borderTopColor: APP_COLORS.warningExpandBorder,
  },
  expandText: {
    fontSize: 12,
    color: APP_COLORS.warningText,
    marginRight: 4,
  },
});

