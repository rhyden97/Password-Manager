export interface ApiKeyItem {
  readonly id: string;
  readonly name: string;
  readonly key: string;
  readonly environment: string;
  readonly scopes: string;
  readonly expires_at: string;
  readonly notes: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface ApiKeyFormData {
  readonly id: string;
  readonly name: string;
  readonly key: string;
  readonly environment: string;
  readonly scopes: string;
  readonly expires_at: string;
  readonly notes: string;
}
