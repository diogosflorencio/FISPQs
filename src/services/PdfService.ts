import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export type PDFDocument = {
  id: string;
  title: string;
  uri: string;
  date?: string;
  source: 'assets' | 'downloaded';
};

interface PdfFile {
  name: string;
  url: string;
  lastModified: string;
  isDownloaded?: boolean;
  localPath?: string;
}

// Usando o diretório de documentos do app para armazenamento permanente
const DOWNLOAD_DIR = Platform.OS === 'ios' 
  ? `${RNFS.DocumentDirectoryPath}/pdfs`
  : `${RNFS.ExternalDirectoryPath}/pdfs`;

const DOWNLOADED_FILES_KEY = '@downloaded_pdfs';

class PDFService {
  private static instance: PDFService;
  private downloadedFiles: Set<string> = new Set();
  private initialized: boolean = false;

  private constructor() {
    // Inicializa de forma assíncrona
    this.initialize().catch(error => 
      console.error('Erro na inicialização do PDFService:', error)
    );
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      console.log('Inicializando PDFService...');
      console.log('Diretório de downloads:', DOWNLOAD_DIR);

      // Garante que o diretório existe
      const exists = await RNFS.exists(DOWNLOAD_DIR);
      if (!exists) {
        console.log('Criando diretório de downloads...');
        await RNFS.mkdir(DOWNLOAD_DIR);
      }

      // Verifica se consegue ler o diretório
      try {
        const files = await RNFS.readDir(DOWNLOAD_DIR);
        console.log('Arquivos encontrados:', files.length);
        
        // Atualiza a lista de arquivos baixados
        this.downloadedFiles.clear();
        files.filter(file => file.name.toLowerCase().endsWith('.pdf'))
             .forEach(file => this.downloadedFiles.add(file.name));
        
        await this.saveDownloadedFiles();
      } catch (readError) {
        console.error('Erro ao ler diretório:', readError);
        // Tenta criar o diretório novamente com permissões completas
        if (Platform.OS === 'android') {
          await RNFS.mkdir(DOWNLOAD_DIR, { NSURLIsExcludedFromBackupKey: false });
        }
      }

      this.initialized = true;
      console.log('PDFService inicializado com sucesso');
    } catch (error) {
      console.error('Erro fatal na inicialização:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async loadDownloadedFiles() {
    try {
      const downloaded = await AsyncStorage.getItem(DOWNLOADED_FILES_KEY);
      if (downloaded) {
        this.downloadedFiles = new Set(JSON.parse(downloaded));
      }
    } catch (error) {
      console.error('Erro ao carregar lista de arquivos baixados:', error);
    }
  }

  private async saveDownloadedFiles() {
    try {
      await AsyncStorage.setItem(
        DOWNLOADED_FILES_KEY,
        JSON.stringify(Array.from(this.downloadedFiles))
      );
    } catch (error) {
      console.error('Erro ao salvar lista de arquivos baixados:', error);
    }
  }

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async ensureDirectoryExists() {
    const exists = await RNFS.exists(DOWNLOAD_DIR);
    if (!exists) {
      await RNFS.mkdir(DOWNLOAD_DIR);
    }
  }

  /**
   * Lists all PDFs from Supabase Storage (remote) and local (downloaded).
   */
  async listAllPDFs(): Promise<PDFDocument[]> {
    console.log('Iniciando listagem de todos os PDFs...');
    // 1. List local PDFs
    const local = await this.listLocalPDFs();
    console.log('PDFs locais encontrados:', local);

    // 2. List remote PDFs from Supabase Storage
    let remote: PDFDocument[] = [];
    try {
      console.log('Buscando PDFs do Supabase...');
      const { data, error } = await supabase.storage.from('fispqs').list('');
      console.log('Resposta do Supabase:', { data, error });
      
      if (!error && data) {
        remote = data
          .filter(item => item.name.toLowerCase().endsWith('.pdf'))
          .map(item => ({
            id: item.name,
            title: item.name.replace('.pdf', ''),
            uri: `supabase://${item.name}`,
            date: item.created_at ? new Date(item.created_at).toLocaleDateString() : undefined,
            source: 'assets',
          }));
        console.log('PDFs remotos processados:', remote);
      }
    } catch (e) {
      console.error('Erro ao listar PDFs do Supabase:', e);
    }

    // 3. Unir listas, priorizando locais se houver duplicidade
    const localIds = new Set(local.map(doc => doc.id));
    const all = [...local, ...remote.filter(doc => !localIds.has(doc.id))];
    console.log('Lista final de PDFs:', all);
    return all;
  }

  /**
   * Baixa um PDF do Supabase Storage para a pasta local.
   */
  async downloadPDFFromSupabase(fileName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.from('fispqs').download(fileName); // Aqui eu pego o bucket do supabase pelo nome
      if (error || !data) {
        console.error('Erro ao baixar PDF do Supabase:', error?.message);
        return false;
      }
      // Salva o arquivo na pasta local
      const destPath = this.getDocumentPath(fileName);
      const fileData = await data.arrayBuffer();
      const buffer = Buffer.from(fileData);
      await RNFS.writeFile(destPath, buffer.toString('base64'), 'base64');
      return true;
    } catch (e) {
      console.error('Erro ao salvar PDF localmente:', e);
      return false;
    }
  }

  /**
   * Lists PDFs from the app's document directory (downloaded PDFs)
   */
  async listLocalPDFs(): Promise<PDFDocument[]> {
    try {
      const documentsPath = `${RNFS.DocumentDirectoryPath}/pdfs`;
      const exists = await RNFS.exists(documentsPath);
      if (!exists) {
        await RNFS.mkdir(documentsPath);
      }
      const files = await RNFS.readDir(documentsPath);
      const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      return pdfFiles.map(file => ({
        id: file.name,
        title: file.name.replace('.pdf', ''),
        uri: Platform.OS === 'ios' ? file.path : `file://${file.path}`,
        date: new Date(file.mtime || '').toLocaleDateString(),
        source: 'downloaded',
      }));
    } catch (error) {
      console.error('Error listing PDFs:', error);
      return [];
    }
  }

  getDocumentPath(filename: string): string {
    return `${RNFS.DocumentDirectoryPath}/pdfs/${filename}`;
  }

  async listPdfs(): Promise<PdfFile[]> {
    await this.ensureInitialized();
    
    try {
      console.log('Listando PDFs do diretório:', DOWNLOAD_DIR);
      
      // Lista os arquivos no diretório de downloads
      const files = await RNFS.readDir(DOWNLOAD_DIR);
      console.log('Total de arquivos encontrados:', files.length);
      
      const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      console.log('PDFs encontrados:', pdfFiles.length);

      // Cria a lista de PDFs baixados
      const downloadedPdfs: PdfFile[] = [];
      
      for (const file of pdfFiles) {
        const fileName = file.name;
        const metaString = await AsyncStorage.getItem(`@pdf_meta_${fileName}`);
        const metadata = metaString ? JSON.parse(metaString) : { lastModified: file.mtime || new Date().toISOString() };
        
        // Adiciona à lista de arquivos baixados se não estiver
        this.downloadedFiles.add(fileName);
        
        downloadedPdfs.push({
          name: fileName,
          url: '',
          lastModified: metadata.lastModified,
          isDownloaded: true,
          localPath: Platform.OS === 'ios' ? file.path : `file://${file.path}`
        });
      }
      
      // Salva a lista atualizada de downloads
      await this.saveDownloadedFiles();

      // Verifica conexão com a internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('Modo offline - Retornando arquivos baixados:', downloadedPdfs.length);
        return downloadedPdfs;
      }

      // Se online, busca a lista completa do Supabase
      console.log('Buscando lista do Supabase...');
      const { data: supabaseFiles, error } = await supabase.storage.from('fispqs').list();
      
      if (error) {
        console.error('Erro ao listar arquivos do Supabase:', error);
        return downloadedPdfs;
      }

      // Mapeia todos os arquivos do Supabase
      const allPdfs = await Promise.all(
        supabaseFiles
          .filter(file => file.name.toLowerCase().endsWith('.pdf'))
          .map(async (file) => {
            const { data: { publicUrl } } = supabase.storage.from('fispqs').getPublicUrl(file.name);
            const isDownloaded = this.downloadedFiles.has(file.name);
            const localFile = pdfFiles.find(f => f.name === file.name);
            const localPath = isDownloaded && localFile
              ? (Platform.OS === 'ios' ? localFile.path : `file://${localFile.path}`)
              : undefined;

            return {
              name: file.name,
              url: publicUrl,
              lastModified: file.metadata?.lastModified || new Date().toISOString(),
              isDownloaded,
              localPath
            };
          })
      );

      return allPdfs;
    } catch (error) {
      console.error('Erro ao listar PDFs:', error);
      // Em caso de erro, tenta retornar os arquivos do diretório local
      try {
        const files = await RNFS.readDir(DOWNLOAD_DIR);
        return files
          .filter(file => file.name.toLowerCase().endsWith('.pdf'))
          .map(file => ({
            name: file.name,
            url: '',
            lastModified: file.mtime?.toString() || new Date().toISOString(),
            isDownloaded: true,
            localPath: Platform.OS === 'ios' ? file.path : `file://${file.path}`
          }));
      } catch (e) {
        console.error('Erro ao ler diretório local:', e);
        return [];
      }
    }
  }

  private async getCachedPdfs(): Promise<PdfFile[]> {
    try {
      const cached = await AsyncStorage.getItem(DOWNLOADED_FILES_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Erro ao obter cache:', error);
      return [];
    }
  }

  private async updateCache(files: PdfFile[]) {
    try {
      await AsyncStorage.setItem(DOWNLOADED_FILES_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
    }
  }

  async downloadPdf(file: PdfFile): Promise<string> {
    await this.ensureDirectoryExists();
    const localPath = `${DOWNLOAD_DIR}/${file.name}`;

    try {
      // Verifica se já existe localmente
      const exists = await RNFS.exists(localPath);
      if (exists) {
        const localMeta = await AsyncStorage.getItem(`@pdf_meta_${file.name}`);
        if (localMeta && JSON.parse(localMeta).lastModified === file.lastModified) {
          console.log('Usando versão em cache:', file.name);
          this.downloadedFiles.add(file.name);
          await this.saveDownloadedFiles();
          return Platform.OS === 'ios' ? localPath : `file://${localPath}`;
        }
      }

      // Verifica conexão com a internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('Sem conexão com a internet');
      }

      console.log('Baixando arquivo:', file.name);
      const { data, error } = await supabase
        .storage
        .from('fispqs')
        .download(file.name);

      if (error) {
        console.error('Erro Supabase:', error);
        if (exists) {
          console.log('Usando versão local disponível:', file.name);
          return Platform.OS === 'ios' ? localPath : `file://${localPath}`;
        }
        throw new Error('Erro ao baixar arquivo do Supabase');
      }

      if (!data) {
        console.error('Nenhum dado recebido do Supabase');
        if (exists) {
          console.log('Usando versão local disponível:', file.name);
          return Platform.OS === 'ios' ? localPath : `file://${localPath}`;
        }
        throw new Error('Nenhum dado recebido do Supabase');
      }

      // Converte o Blob para base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Resultado inválido do FileReader'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(data);
      });

      // Remove o prefixo data:application/pdf;base64, do base64
      const base64Clean = base64Data.split(',')[1];

      console.log('Salvando arquivo em:', localPath);
      try {
        await RNFS.writeFile(localPath, base64Clean, 'base64');
        
        // Verifica se o arquivo foi salvo corretamente
        const fileExists = await RNFS.exists(localPath);
        if (!fileExists) {
          throw new Error('Arquivo não foi salvo corretamente');
        }

        // Atualiza a lista de arquivos baixados
        this.downloadedFiles.add(file.name);
        await this.saveDownloadedFiles();

        // Atualiza os metadados do arquivo local
        await AsyncStorage.setItem(`@pdf_meta_${file.name}`, JSON.stringify({
          lastModified: file.lastModified,
          downloadedAt: new Date().toISOString(),
        }));

        console.log('Arquivo salvo com sucesso:', localPath);
        return Platform.OS === 'ios' ? localPath : `file://${localPath}`;
      } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        // Remove o arquivo da lista de downloads se houver erro
        this.downloadedFiles.delete(file.name);
        await this.saveDownloadedFiles();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        console.log('Usando versão local como fallback:', file.name);
        return Platform.OS === 'ios' ? localPath : `file://${localPath}`;
      }
      throw error;
    }
  }

  async isFileDownloaded(fileName: string): Promise<boolean> {
    return this.downloadedFiles.has(fileName);
  }

  async getLocalPdfPath(fileName: string): Promise<string | null> {
    const localPath = `${DOWNLOAD_DIR}/${fileName}`;
    const exists = await RNFS.exists(localPath);
    return exists ? localPath : null;
  }

  async syncPdfs(): Promise<void> {
    try {
      const remotePdfs = await this.listPdfs();
      const localFiles = await RNFS.readDir(DOWNLOAD_DIR);

      // Remove PDFs que não existem mais no Supabase
      for (const localFile of localFiles) {
        const remoteFile = remotePdfs.find(rf => rf.name === localFile.name);
        if (!remoteFile) {
          await RNFS.unlink(localFile.path);
          await AsyncStorage.removeItem(`@pdf_meta_${localFile.name}`);
        }
      }

      // Atualiza PDFs modificados
      for (const remotePdf of remotePdfs) {
        const localMeta = await AsyncStorage.getItem(`@pdf_meta_${remotePdf.name}`);
        if (!localMeta || JSON.parse(localMeta).lastModified !== remotePdf.lastModified) {
          await this.downloadPdf(remotePdf);
        }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }
}

export default PDFService.getInstance();