export interface SecurityCodeItem {
  readonly id: string;
  readonly title: string;
  readonly codes: string;
  readonly file_name?: string;
  readonly file_type?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface SecurityCodeFormData {
  readonly id: string;
  readonly title: string;
  readonly codes: string;
  readonly file_name: string;
  readonly file_type: string;
  readonly file_data: string;
}
