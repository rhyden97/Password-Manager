import { useState, useCallback, useMemo, useRef } from 'react';
import { CredentialItem, CredentialFormData } from '../types/credential';
import {
  fetchRawCredentials,
  insertCredentialRecord,
  updateCredentialRecord,
  deleteCredentialRecord,
} from '../services/credentialService';
import { encryptFields, decryptFields } from '../utils/crypto';

const CREDENTIAL_FIELDS = ['title', 'url', 'username', 'password', 'notes'] as const;

export function useCredentials(
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void
) {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const loadIdRef = useRef(0);

  const clearCredentials = useCallback((): void => {
    loadIdRef.current += 1;
    setCredentials([]);
    setVisiblePasswords({});
    setSearchTerm('');
    setIsLoading(false);
  }, []);

  const loadCredentials = useCallback(
    async (masterKey: CryptoKey, userId: string): Promise<void> => {
      if (!userId || !masterKey) return;
      const loadId = loadIdRef.current + 1;
      loadIdRef.current = loadId;
      setIsLoading(true);
      const { data, error } = await fetchRawCredentials(userId);

      if (loadId !== loadIdRef.current) return;
      setIsLoading(false);

      if (error || !data) {
        onToast(error || 'Failed to load credentials', 'error');
        return;
      }

      try {
        const decryptedList = await Promise.all(
          data.map(async (row) => {
            const fields = await decryptFields<Record<string, string>>(
              row as unknown as Record<string, unknown>,
              CREDENTIAL_FIELDS,
              masterKey
            );
            return {
              id: row.id,
              title: fields.title || '',
              url: fields.url || '',
              username: fields.username || '',
              password: fields.password || '',
              notes: fields.notes || '',
              created_at: row.created_at,
              updated_at: row.updated_at,
            };
          })
        );

        if (loadId !== loadIdRef.current) return;
        setCredentials(decryptedList);
      } catch (error) {
        if (loadId !== loadIdRef.current) return;
        console.error(error);
        onToast('Could not decrypt credentials', 'error');
      }
    },
    [onToast]
  );

  const saveCredential = useCallback(
    async (
      formData: CredentialFormData,
      masterKey: CryptoKey,
      userId: string
    ): Promise<boolean> => {
      if (!formData.title || !formData.password) {
        onToast('Title and password are required', 'error');
        return false;
      }

      setIsLoading(true);
      const loadIdBeforeSave = loadIdRef.current;
      const { ciphertexts, ivs } = await encryptFields(
        {
          title: formData.title,
          url: formData.url,
          username: formData.username,
          password: formData.password,
          notes: formData.notes,
        },
        CREDENTIAL_FIELDS,
        masterKey
      );

      const isUpdate = Boolean(formData.id);
      const { error } = isUpdate
        ? await updateCredentialRecord(formData.id, ciphertexts, ivs)
        : await insertCredentialRecord(userId, ciphertexts, ivs);

      setIsLoading(false);
      if (error) {
        onToast(error, 'error');
        return false;
      }

      if (loadIdRef.current === loadIdBeforeSave) {
        await loadCredentials(masterKey, userId);
      }
      onToast(isUpdate ? 'Credential updated' : 'Credential saved', 'success');
      return true;
    },
    [loadCredentials, onToast]
  );

  const removeCredential = useCallback(
    async (credentialId: string): Promise<boolean> => {
      setIsLoading(true);
      const { error } = await deleteCredentialRecord(credentialId);
      setIsLoading(false);

      if (error) {
        onToast(error, 'error');
        return false;
      }

      setCredentials((previous) => previous.filter((item) => item.id !== credentialId));
      onToast('Credential deleted', 'info');
      return true;
    },
    [onToast]
  );

  const togglePasswordVisibility = useCallback((id: string) => {
    setVisiblePasswords((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }, []);

  const filteredCredentials = useMemo(() => {
    if (!searchTerm.trim()) return credentials;
    const term = searchTerm.toLowerCase();
    return credentials.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.username.toLowerCase().includes(term) ||
        item.url.toLowerCase().includes(term)
    );
  }, [credentials, searchTerm]);

  return {
    credentials,
    filteredCredentials,
    isLoading,
    searchTerm,
    setSearchTerm,
    visiblePasswords,
    loadCredentials,
    clearCredentials,
    saveCredential,
    removeCredential,
    togglePasswordVisibility,
  };
}
