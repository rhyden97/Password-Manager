export interface CredentialItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly username: string;
  readonly password: string;
  readonly notes: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface CredentialFormData {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly username: string;
  readonly password: string;
  readonly notes: string;
}
