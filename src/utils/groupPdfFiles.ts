import { parseFileName } from './parseFileName';

export interface PdfFileLike {
  name: string;
}

export interface DocTypeGroup<T extends PdfFileLike> {
  docType: string;
  files: T[];
}

/** Agrupamento: tipo de contrato → tipos de documento → arquivos. */
export type GroupedFiles<T extends PdfFileLike> = Record<string, DocTypeGroup<T>[]>;

export interface PdfListSection<T extends PdfFileLike> {
  key: string;
  /** Título da seção = tipo de contrato. */
  title: string;
  /** Subtítulo = tipo de documento (FDS, Autorização…). */
  subtitle?: string;
  kind: 'favorites' | 'group' | 'flat';
  data: T[];
}

export type PdfListRow<T extends PdfFileLike> =
  | {
      kind: 'header';
      id: string;
      contractType: string;
      docType: string;
      /** false quando outro bloco do mesmo tipo de contrato (1ª parte) já exibiu o título. */
      showContractTitle: boolean;
    }
  | { kind: 'file'; id: string; file: T };

export function buildGroupedRows<T extends PdfFileLike>(
  sections: PdfListSection<T>[],
): PdfListRow<T>[] {
  const rows: PdfListRow<T>[] = [];
  let lastContractType = '';

  for (const section of sections) {
    if (section.data.length === 0) continue;
    const showContractTitle = section.title !== lastContractType;
    lastContractType = section.title;
    rows.push({
      kind: 'header',
      id: `header::${section.key}`,
      contractType: section.title,
      docType: section.subtitle ?? '',
      showContractTitle,
    });
    for (const file of section.data) {
      rows.push({ kind: 'file', id: file.name, file });
    }
  }

  return rows;
}

export function isListFiltered(searchQuery: string, filterType: string | null): boolean {
  return Boolean(searchQuery.trim()) || filterType !== null;
}

function searchableBlob(name: string): string {
  const parsed = parseFileName(name);
  const base = name.replace(/\.pdf$/i, '');
  return [base, parsed.contractType, parsed.docType, parsed.docName].join(' ').toLowerCase();
}

export function filterPdfFiles<T extends PdfFileLike>(
  files: T[],
  searchQuery: string,
  filterType: string | null,
): T[] {
  const q = searchQuery.toLowerCase().trim();

  return files.filter(f => {
    if (!f?.name) return false;
    const parsed = parseFileName(f.name);
    const matchSearch = !q || searchableBlob(f.name).includes(q);
    const matchType = !filterType || parsed.docType === filterType;
    return matchSearch && matchType;
  });
}

export function collectDocTypes<T extends PdfFileLike>(files: T[]): string[] {
  const types = new Set<string>();
  for (const f of files) {
    if (!f?.name) continue;
    const { docType } = parseFileName(f.name);
    if (docType) types.add(docType);
  }
  return [...types].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function groupPdfFiles<T extends PdfFileLike>(
  files: T[],
  favorites: Set<string>,
): { favorites: T[]; grouped: GroupedFiles<T> } {
  const favList: T[] = [];
  const nonFav: T[] = [];

  for (const f of files) {
    if (!f?.name) continue;
    if (favorites.has(f.name)) {
      favList.push(f);
    } else {
      nonFav.push(f);
    }
  }

  favList.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const grouped = nonFav.reduce<GroupedFiles<T>>((acc, f) => {
    const parsed = parseFileName(f.name);
    const contractType = parsed.contractType || 'Sem tipo de contrato';
    const docType = parsed.docType || 'Outros';

    if (!acc[contractType]) acc[contractType] = [];

    let group = acc[contractType].find(g => g.docType === docType);
    if (!group) {
      group = { docType, files: [] };
      acc[contractType].push(group);
    }
    group.files.push(f);
    return acc;
  }, {});

  for (const contractType of Object.keys(grouped)) {
    grouped[contractType].sort((a, b) => a.docType.localeCompare(b.docType, 'pt-BR'));
    for (const g of grouped[contractType]) {
      g.files.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
  }

  return { favorites: favList, grouped };
}

export function buildPdfSections<T extends PdfFileLike>(
  favorites: T[],
  grouped: GroupedFiles<T>,
): PdfListSection<T>[] {
  const sections: PdfListSection<T>[] = [];

  const contractTypes = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  for (const contractType of contractTypes) {
    for (const group of grouped[contractType]) {
      if (group.files.length === 0) continue;
      sections.push({
        key: `${contractType}::${group.docType}`,
        title: contractType,
        subtitle: group.docType,
        kind: 'group',
        data: group.files,
      });
    }
  }

  return sections;
}

/** Lista plana para busca/filtro — evita cabeçalhos de grupo quebrados. */
export function buildFlatSections<T extends PdfFileLike>(files: T[]): PdfListSection<T>[] {
  if (files.length === 0) return [];

  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return [
    {
      key: '__flat__',
      title: '',
      kind: 'flat',
      data: sorted,
    },
  ];
}

export function buildListSections<T extends PdfFileLike>(
  files: T[],
  favorites: Set<string>,
  searchQuery: string,
  filterType: string | null,
): { favoriteFiles: T[]; listSections: PdfListSection<T>[] } {
  const filtered = filterPdfFiles(files, searchQuery, filterType);

  if (isListFiltered(searchQuery, filterType)) {
    return {
      favoriteFiles: [],
      listSections: buildFlatSections(filtered),
    };
  }

  const { favorites: favFiles, grouped } = groupPdfFiles(filtered, favorites);
  return {
    favoriteFiles: favFiles,
    listSections: buildPdfSections([], grouped),
  };
}
