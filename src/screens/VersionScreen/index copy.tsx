import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../config/theme';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const VersionScreen: React.FC = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:diogosflorencio@gmail.com');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="info" size={50} color={APP_COLORS.primary} />
        <Text style={styles.headerTitle}>FISPQs - Meio Ambiente</Text>
        <Text style={styles.version}>Versão 1.2.0 - avisos e feedbacks</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Versões Futuras</Text>

        {/* Versão Futura */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="new-releases" size={20} color={APP_COLORS.primary} /> Versão 2.0.0 (não será implementado - projeto pausado)
          </Text>
          <Text style={styles.versionDate}>Previsão: Agosto/2025</Text>
          <Text style={styles.versionText}>
            Grandes mudanças planejadas:{'\n'}
            • Sistema de categorização de FISPQs (permitirá separar por contrato ou tipo de fispq){'\n'}
            • Integração com setor de Inspeções de Segurança, Meio Ambiente e Qualidade{'\n'}
            • Criação e edição offline de inspeções com sincronização posterior (quando houver internet){'\n'}
            • Reformulação do banco de dados para suportar novas funcionalidades (versões anteriores do app perdirão a compatibilidade){'\n'}
            • Sistema de notificações para atualizações{'\n'}
            • Modo escuro para melhor visualização em campo{'\n'}
            • Sistema de anexos de fotos nas inspeções com compressão offline{'\n'}
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Nova arquitetura de banco de dados para categorização{'\n'}
            • API RESTful para sincronização bidirecional{'\n'}
            • Sistema robusto de cache offline com SQLite{'\n'}
            • Implementação de workers para processamento em background{'\n'}
            • Sistema de filas para sincronização resiliente{'\n'}
            • Compressão e otimização de imagens no dispositivo{'\n'}
            • Sistema de autenticação e autorização por perfil (Cada inspecionador terá seu próprio perfil (isso vai dar um trabalho...))
          </Text>
          <Text style={styles.note}>
            Nota: Esta versão tornará as versões anteriores incompatíveis devido às mudanças estruturais no banco de dados e na arquitetura do aplicativo.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Versões</Text>

        {/* Versão Atual */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="new-releases" size={20} color={APP_COLORS.primary} /> Versão 1.1.2 - segurança
          </Text>
          <Text style={styles.versionDate}>Lançamento: Outubro/2025</Text>
          <Text style={styles.versionText}>
            Adições e mudanças:{'\n'}
            • Atualização extremamente necessária seguindo as implementações de segurança exigidas pelo Google para alocação de página de memória acima de 16KB{'\n'}
            • Ajustes de conformidade e endurecimento de permissões e políticas da plataforma{'\n'}
            • Melhorias em vários parâmetros de desempenho, estabilidade e consumo de recursos{'\n'}
            • Otimizações gerais e pequenas correções
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Revisões em configurações e limites de memória visando compatibilidade com novas diretrizes{'\n'}
            • Ajustes de build e dependências para políticas atualizadas do ecossistema Google/Play{'\n'}
            • Pequenas refatorações para reduzir overhead e melhorar telemetria interna
          </Text>
        </View>
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="history" size={20} color={APP_COLORS.primary} /> Versão 1.1.1 - lançamento ao público
          </Text>
          <Text style={styles.versionDate}>Lançamento: Junho/2025</Text>
          <Text style={styles.versionText}>
            Otimizações finais antes do lançamento ao público:{'\n'}
            • Ajustes finais de interface e experiência do usuário{'\n'}
            • Correções de bugs reportados durante testes internos{'\n'}
            • Otimizações de performance e estabilidade{'\n'}
            • Preparação para lançamento na Google Play Store
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Polimento final da interface{'\n'}
            • Correções de bugs menores{'\n'}
            • Melhorias de performance geral{'\n'}
            • Preparação para publicação pública
          </Text>
        </View>
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="history" size={20} color={APP_COLORS.primary} /> Versão 1.1.0 - páginas
          </Text>
          <Text style={styles.versionDate}>Lançamento: Junho/2025</Text>
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
            • Implementação do React Navigation v6{'\n'}
            • Refatoração da estrutura de componentes{'\n'}
            • Organização em módulos independentes{'\n'}
            • Melhorias na gestão de estado
          </Text>
        </View>

        {/* Versão Inicial */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            <Icon name="history" size={20} color={APP_COLORS.primary} /> Versão 1.0.0 - natália
          </Text>
          <Text style={styles.versionDate}>Lançamento: Maio/2025</Text>
          <Text style={styles.versionText}>
            Concepção inicial do projeto, idealizado por Natalia:{'\n'}
            • Listagem de FISPQs{'\n'}
            • Visualização dos documentos em PDF{'\n'}
            • Sistema de download para uso offline{'\n'}
            • Busca por nome de arquivo{'\n'}
            • Indicador de disponibilidade offline
          </Text>
          <Text style={styles.versionDetails}>
            Detalhes técnicos:{'\n'}
            • Integração com Supabase{'\n'}
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
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: APP_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginTop: 12,
  },
  version: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginBottom: 16,
  },
  versionBlock: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginBottom: 4,
  },
  versionDate: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  versionText: {
    fontSize: 14,
    color: APP_COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  versionDetails: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    lineHeight: 22,
    backgroundColor: APP_COLORS.surfaceMuted,
    padding: 12,
    borderRadius: 6,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
  },
  footerText: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: APP_COLORS.primary,
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: 12,
    color: APP_COLORS.warning,
    fontStyle: 'italic',
    marginTop: 12,
    backgroundColor: APP_COLORS.surfaceWarningNote,
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.warningBorder,
  },
}); 