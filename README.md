# Visualizador de FISPQs

Aplicativo React Native para visualização de FISPQs (PDFs) armazenados no Supabase.

## Funcionalidades

- Lista de PDFs disponíveis
- Download para visualização offline
- Sincronização automática com o Supabase
- Visualização de PDFs com suporte a zoom e paginação
- Cache local para economia de dados

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```bash
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Para iOS, instale os pods:
```bash
cd ios && pod install && cd ..
```

5. Inicie o Metro bundler:
```bash
npm start
```

6. Execute o aplicativo:
```bash
# Para Android
npm run android

# Para iOS
npm run ios
```

## Estrutura do Projeto

- `src/components/`: Componentes React Native
  - `PdfList/`: Lista de PDFs disponíveis
  - `PdfViewer/`: Visualizador de PDF
- `src/services/`: Serviços e utilitários
  - `PdfService.ts`: Gerenciamento de PDFs (download, cache, sincronização)
- `src/config/`: Configurações
  - `supabase.ts`: Configuração do cliente Supabase

## Tecnologias Utilizadas

- React Native
- Supabase (armazenamento)
- react-native-pdf (visualização de PDFs)
- react-native-fs (gerenciamento de arquivos)
- AsyncStorage (cache local)

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request
