import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';

export function toFsPath(localPath?: string | null): string | null {
  if (!localPath) {
    return null;
  }
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
  const fileUrl = `file://${path}`;

  try {
    await Share.open({
      title: filename,
      url: fileUrl,
      type: 'application/pdf',
      filename,
      failOnCancel: false,
    });
  } catch (err) {
    console.error('Erro ao compartilhar PDF:', err);
    Alert.alert('Compartilhar', 'Não foi possível abrir o compartilhamento. Tente de novo.');
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
