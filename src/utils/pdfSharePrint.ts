import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';

const PDF_SHARE_PROMO_MESSAGE =
  'Baixe o aplicativo de FDS/FISPQs em https://play.google.com/store/apps/details?id=com.fispqs (por enquanto somente para android)';

export function toFsPath(localPath?: string | null): string | null {
  if (!localPath) return null;
  return localPath.replace(/^file:\/\//, '');
}

function displayFilename(name: string): string {
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

export async function sharePdfFile(displayName: string, localPath?: string | null): Promise<void> {
  const path = toFsPath(localPath);

  if (!path || !(await RNFS.exists(path))) {
    Alert.alert('Arquivo não encontrado', 'Baixe o FDS/FISPQ antes de compartilhar.');
    return;
  }

  const filename = displayFilename(displayName);

  // Copia para CachesDirectoryPath — acessível por outros apps via FileProvider
  const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

  try {
    await RNFS.copyFile(path, destPath);
  } catch (copyErr) {
    console.error('Erro ao copiar PDF para cache:', copyErr);
    Alert.alert('Erro', 'Não foi possível preparar o arquivo para compartilhamento.');
    return;
  }

  const fileUrl = `file://${destPath}`;

  try {
    await Share.open({
      title: filename,
      message: PDF_SHARE_PROMO_MESSAGE,
      url: fileUrl,
      type: 'application/pdf',
      filename,
      failOnCancel: false,
    });
  } catch (err) {
    console.error('Erro ao compartilhar PDF:', err);
    Alert.alert('Erro ao compartilhar', 'Não foi possível compartilhar o arquivo.');
  } finally {
    RNFS.unlink(destPath).catch(() => {});
  }
}

export async function printPdfFile(displayName: string, localPath?: string | null): Promise<void> {
  const path = toFsPath(localPath);

  if (!path || !(await RNFS.exists(path))) {
    Alert.alert('Arquivo não encontrado', 'Baixe o FDS/FISPQ antes de imprimir.');
    return;
  }

  const jobName = displayName.replace(/\.pdf$/i, '') || 'Documento';

  try {
    await RNPrint.print({ filePath: path, jobName });
  } catch (err) {
    console.error('Erro ao imprimir PDF:', err);
    Alert.alert('Impressão', 'Não foi possível abrir a impressão. Tente de novo.');
  }
}