export interface ParsedFileName {
  /** 1ª parte do nome — tipo de contrato (ex.: Conami, Comum, Samarco). */
  contractType: string;
  /** 2ª parte — tipo de documento (ex.: FDS, Autorização). */
  docType: string;
  /** Restante — nome do documento. */
  docName: string;
  isValid: boolean;
  raw: string;
}

/**
 * Quebra nomes no formato `TIPO DE CONTRATO - TIPO DOC - Nome.pdf`.
 * Mesma regra do dashboard; a 1ª parte categoriza por tipo de contrato, não por empresa.
 */
export function parseFileName(raw: string | null | undefined): ParsedFileName {
  const safe = typeof raw === 'string' ? raw : '';
  const withoutExt = safe.replace(/\.[^.]+$/, '');
  const parts = withoutExt.split(/\s+-\s+/).map(s => s.trim()).filter(Boolean);

  if (parts.length >= 3) {
    return {
      contractType: parts[0],
      docType: parts[1],
      docName: parts.slice(2).join(' - '),
      isValid: true,
      raw: safe,
    };
  }

  if (parts.length === 2) {
    return {
      contractType: parts[0],
      docType: parts[1],
      docName: '',
      isValid: false,
      raw: safe,
    };
  }

  return {
    contractType: '',
    docType: '',
    docName: withoutExt,
    isValid: false,
    raw: safe,
  };
}

export function displayPdfTitle(filename: string | null | undefined): string {
  const safe = typeof filename === 'string' ? filename : '';
  if (!safe) return 'Documento sem nome';

  const parsed = parseFileName(safe);
  if (parsed.isValid && parsed.docName) {
    return parsed.docName;
  }
  return safe.replace(/\.pdf$/i, '') || safe;
}
