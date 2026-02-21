import { useState, useCallback, useMemo, useRef } from 'react';
import { ApiKeyItem, ApiKeyFormData } from '../types/apiKey';
import {
  fetchRawApiKeys,
  insertApiKeyRecord,
  updateApiKeyRecord,
  deleteApiKeyRecord,
} from '../services/apiKeyService';
import { encryptFields, decryptFields } from '../utils/crypto';

const API_KEY_FIELDS = ['name', 'key', 'environment', 'scopes', 'expires_at', 'notes'] as const;

export function useApiKeys(
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void
) {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const loadIdRef = useRef(0);

  const clearApiKeys = useCallback((): void => {
    loadIdRef.current += 1;
    setApiKeys([]);
    setVisibleKeys({});
    setSearchTerm('');
    setIsLoading(false);
  }, []);

  const loadApiKeys = useCallback(
    async (masterKey: CryptoKey, userId: string): Promise<void> => {
      if (!userId || !masterKey) return;
      const loadId = loadIdRef.current + 1;
      loadIdRef.current = loadId;
      setIsLoading(true);
      const { data, error } = await fetchRawApiKeys(userId);

      if (loadId !== loadIdRef.current) return;
      setIsLoading(false);

      if (error || !data) {
        onToast(error || 'Failed to load API keys', 'error');
        return;
      }

      try {
        const decryptedList = await Promise.all(
          data.map(async (row) => {
            const fields = await decryptFields<Record<string, string>>(
              row as unknown as Record<string, unknown>,
              API_KEY_FIELDS,
              masterKey
            );
            return {
              id: row.id,
              name: fields.name || '',
              key: fields.key || '',
              environment: fields.environment || '',
              scopes: fields.scopes || '',
              expires_at: fields.expires_at || '',
              notes: fields.notes || '',
              created_at: row.created_at,
              updated_at: row.updated_at,
            };
          })
        );

        if (loadId !== loadIdRef.current) return;
        setApiKeys(decryptedList);
      } catch (error) {
        if (loadId !== loadIdRef.current) return;
        console.error(error);
        onToast('Could not decrypt API keys', 'error');
      }
    },
    [onToast]
  );

  const saveApiKey = useCallback(
    async (
      formData: ApiKeyFormData,
      masterKey: CryptoKey,
      userId: string
    ): Promise<boolean> => {
      if (!formData.name || !formData.key) {
        onToast('Name and API key are required', 'error');
        return false;
      }

      setIsLoading(true);
      const loadIdBeforeSave = loadIdRef.current;
      const { ciphertexts, ivs } = await encryptFields(
        {
          name: formData.name,
          key: formData.key,
          environment: formData.environment,
          scopes: formData.scopes,
          expires_at: formData.expires_at,
          notes: formData.notes,
        },
        API_KEY_FIELDS,
        masterKey
      );

      const isUpdate = Boolean(formData.id);
      const { error } = isUpdate
        ? await updateApiKeyRecord(formData.id, ciphertexts, ivs)
        : await insertApiKeyRecord(userId, ciphertexts, ivs);

      setIsLoading(false);
      if (error) {
        onToast(error, 'error');
        return false;
      }

      if (loadIdRef.current === loadIdBeforeSave) {
        await loadApiKeys(masterKey, userId);
      }
      onToast(isUpdate ? 'API key updated' : 'API key saved', 'success');
      return true;
    },
    [loadApiKeys, onToast]
  );

  const removeApiKey = useCallback(
    async (apiKeyId: string): Promise<boolean> => {
      setIsLoading(true);
      const { error } = await deleteApiKeyRecord(apiKeyId);
      setIsLoading(false);

      if (error) {
        onToast(error, 'error');
        return false;
      }

      setApiKeys((previous) => previous.filter((item) => item.id !== apiKeyId));
      onToast('API key deleted', 'info');
      return true;
    },
    [onToast]
  );

  const toggleKeyVisibility = useCallback((id: string) => {
    setVisibleKeys((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }, []);

  const filteredApiKeys = useMemo(() => {
    if (!searchTerm.trim()) return apiKeys;
    const term = searchTerm.toLowerCase();
    return apiKeys.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.environment.toLowerCase().includes(term) ||
        item.scopes.toLowerCase().includes(term)
    );
  }, [apiKeys, searchTerm]);

  return {
    apiKeys,
    filteredApiKeys,
    isLoading,
    searchTerm,
    setSearchTerm,
    visibleKeys,
    loadApiKeys,
    clearApiKeys,
    saveApiKey,
    removeApiKey,
    toggleKeyVisibility,
  };
}
