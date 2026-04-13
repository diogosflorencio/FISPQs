// Paleta central do app. Ajuste aqui para refletir em telas que usam APP_COLORS.
// Cor verde anterior (histórico): #004000

export const APP_COLORS = {
  // Marca
  primary: '#003A8C',
  primaryTextOnPrimary: '#FFFFFF',
  primaryDark: '#00265C',
  primaryLight: '#1565C0',

  /** Acento para ícones de ação (PDF, download, impressão) e links secundários */
  secondary: '#1565C0',
  secondaryTextOnSecondary: '#FFFFFF',

  // Superfícies
  background: 'rgb(224, 224, 224)',
  surface: 'rgb(245, 245, 245)',
  surfaceMuted: '#F8F8F8',
  surfaceWarningNote: '#FFF8E1',

  // Texto
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  textDisabled: '#AAAAAA',
  textOnPrimary: '#FFFFFF',

  // Bordas / divisores
  border: '#E0E0E0',
  divider: '#E0E0E0',

  // Semânticas
  success: '#1D9E75',
  warning: '#FF9800',
  warningSurface: '#FFF3CD',
  warningText: '#856404',
  warningBorder: '#FF9800',
  warningExpandBorder: '#FFE082',
  error: '#D32F2F',
  errorBright: '#FF4444',

  // Leitor de PDF
  viewerBackground: '#181A20',
  pdfPageBackground: '#FFFFFF',
  overlayScrim: 'rgba(24, 26, 32, 0.7)',
  overlayFooter: 'rgba(0, 0, 0, 0.62)',

  // Navegação
  tabBarInactive: '#666666',

  // Sombra (iOS; no Android elevation ignora em parte)
  shadow: '#000000',
} as const;

export type AppColors = typeof APP_COLORS;
