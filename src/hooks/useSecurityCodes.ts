import { useState, useCallback, useMemo, useRef } from 'react';
import { SecurityCodeItem, SecurityCodeFormData } from '../types/securityCode';
import {
  fetchRawSecurityCodes,
  insertSecurityCodeRecord,
  updateSecurityCodeRecord,
  deleteSecurityCodeRecord,
} from '../services/securityCodeService';
import { encryptFields, decryptFields } from '../utils/crypto';
import { parseSecurityCodes } from '../utils/securityCodeParser';

const SECURITY_CODE_FIELDS = ['title', 'codes', 'file_name', 'file_type'] as const;

export function useSecurityCodes(
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void
) {
  const [securityCodes, setSecurityCodes] = useState<SecurityCodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loadIdRef = useRef(0);

  const clearSecurityCodes = useCallback((): void => {
    loadIdRef.current += 1;
    setSecurityCodes([]);
    setSearchTerm('');
    setIsLoading(false);
  }, []);

  const loadSecurityCodes = useCallback(
    async (masterKey: CryptoKey, userId: string): Promise<void> => {
      if (!userId || !masterKey) return;
      const loadId = loadIdRef.current + 1;
      loadIdRef.current = loadId;
      setIsLoading(true);
      const { data, error } = await fetchRawSecurityCodes(userId);

      if (loadId !== loadIdRef.current) return;
      setIsLoading(false);

      if (error || !data) {
        onToast(error || 'Failed to load security codes', 'error');
        return;
      }

      try {
        const decryptedList = await Promise.all(
          data.map(async (row) => {
            const fields = await decryptFields<Record<string, string>>(
              row as unknown as Record<string, unknown>,
              SECURITY_CODE_FIELDS,
              masterKey
            );
            return {
              id: row.id,
              title: fields.title || '',
              codes: fields.codes || '',
              file_name: fields.file_name || undefined,
              file_type: fields.file_type || undefined,
              created_at: row.created_at,
              updated_at: row.updated_at,
            };
          })
        );

        if (loadId !== loadIdRef.current) return;
        setSecurityCodes(decryptedList);
      } catch (error) {
        if (loadId !== loadIdRef.current) return;
        console.error(error);
        onToast('Could not decrypt security codes', 'error');
      }
    },
    [onToast]
  );

  const saveSecurityCode = useCallback(
    async (
      formData: SecurityCodeFormData,
      masterKey: CryptoKey,
      userId: string
    ): Promise<boolean> => {
      if (!formData.title || !formData.codes) {
        onToast('Title and codes are required', 'error');
        return false;
      }

      setIsLoading(true);
      const loadIdBeforeSave = loadIdRef.current;
      const { ciphertexts, ivs } = await encryptFields(
        {
          title: formData.title,
          codes: formData.codes,
          file_name: formData.file_name,
          file_type: formData.file_type,
        },
        SECURITY_CODE_FIELDS,
        masterKey
      );

      const isUpdate = Boolean(formData.id);
      const { error } = isUpdate
        ? await updateSecurityCodeRecord(formData.id, ciphertexts, ivs)
        : await insertSecurityCodeRecord(userId, ciphertexts, ivs);

      setIsLoading(false);
      if (error) {
        onToast(error, 'error');
        return false;
      }

      if (loadIdRef.current === loadIdBeforeSave) {
        await loadSecurityCodes(masterKey, userId);
      }
      onToast(isUpdate ? 'Security codes updated' : 'Security codes saved', 'success');
      return true;
    },
    [loadSecurityCodes, onToast]
  );

  const removeSecurityCode = useCallback(
    async (codeId: string): Promise<boolean> => {
      setIsLoading(true);
      const { error } = await deleteSecurityCodeRecord(codeId);
      setIsLoading(false);

      if (error) {
        onToast(error, 'error');
        return false;
      }

      setSecurityCodes((previous) => previous.filter((item) => item.id !== codeId));
      onToast('Security codes deleted', 'info');
      return true;
    },
    [onToast]
  );

  const consumeSecurityCode = useCallback(
    async (
      codeId: string,
      codeToConsume: string,
      masterKey: CryptoKey,
      userId: string
    ): Promise<boolean> => {
      const target = securityCodes.find((item) => item.id === codeId);
      if (!target) return false;

      const remainingLines = parseSecurityCodes(target.codes)
        .filter((code) => code !== codeToConsume.trim())
        .join('\n');

      return await saveSecurityCode(
        {
          id: target.id,
          title: target.title,
          codes: remainingLines,
          file_name: target.file_name || '',
          file_type: target.file_type || '',
          file_data: '',
        },
        masterKey,
        userId
      );
    },
    [securityCodes, saveSecurityCode]
  );

  const filteredSecurityCodes = useMemo(() => {
    if (!searchTerm.trim()) return securityCodes;
    const term = searchTerm.toLowerCase();
    return securityCodes.filter((item) => item.title.toLowerCase().includes(term));
  }, [securityCodes, searchTerm]);

  return {
    securityCodes,
    filteredSecurityCodes,
    isLoading,
    searchTerm,
    setSearchTerm,
    loadSecurityCodes,
    clearSecurityCodes,
    saveSecurityCode,
    removeSecurityCode,
    consumeSecurityCode,
  };
}
