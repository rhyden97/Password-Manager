import { useState } from 'react';
import { MAX_IMPORT_BYTES } from '../constants/cryptoConstants';
import { formatSecurityCodes, parseSecurityCodes } from '../utils/securityCodeParser';

const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
]);

interface UseSecurityCodeImportProps {
  readonly initialCodes?: string;
  readonly initialFileName?: string;
  readonly initialFileType?: string;
}

export function useSecurityCodeImport({
  initialCodes = '',
  initialFileName = '',
  initialFileType = '',
}: UseSecurityCodeImportProps = {}) {
  const [codes, setCodes] = useState(initialCodes);
  const [fileName, setFileName] = useState(initialFileName);
  const [fileType, setFileType] = useState(initialFileType);
  const [fileError, setFileError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const hasAllowedExtension = /\.(txt|csv)$/i.test(file.name);
    if (!hasAllowedExtension && !ALLOWED_MIME_TYPES.has(file.type)) {
      setFileError('Only .txt or .csv files are supported');
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setFileError(`File exceeds the limit of ${MAX_IMPORT_BYTES / 1024} KB`);
      return;
    }

    setFileError('');
    setFileName(file.name);
    setFileType(file.type || 'text/plain');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) setCodes(formatSecurityCodes(content));
    };
    reader.onerror = () => setFileError('Failed to read the file');
    reader.readAsText(file);
  };

  const handlePasteCodes = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text');
    if (!pastedText) return;

    const parsed = parseSecurityCodes(pastedText);
    if (parsed.length > 1) {
      event.preventDefault();
      const formatted = parsed.join('\n');
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const current = codes;

      let nextValue: string;
      if (start === 0 && end === current.length) {
        nextValue = formatted;
      } else {
        const prefix = current.slice(0, start);
        const suffix = current.slice(end);
        const needsLeading = prefix.length > 0 && !prefix.endsWith('\n');
        const needsTrailing = suffix.length > 0 && !suffix.startsWith('\n');
        nextValue = `${prefix}${needsLeading ? '\n' : ''}${formatted}${needsTrailing ? '\n' : ''}${suffix}`;
      }
      setCodes(nextValue);
    }
  };

  const handleFormatCodes = () => {
    if (!codes.trim()) return;
    setCodes(formatSecurityCodes(codes));
  };

  return {
    codes,
    setCodes,
    fileName,
    fileType,
    fileError,
    handleFileUpload,
    handlePasteCodes,
    handleFormatCodes,
  };
}
