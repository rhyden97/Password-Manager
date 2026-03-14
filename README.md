# Fortress - Secret Manager & 2FA Vault

Fortress is a minimalist secret manager built with React 19, TypeScript, Tailwind CSS, and Supabase.

All credentials, API keys, and 2FA recovery backup codes are encrypted directly in the browser using the native Web Crypto API (`crypto.subtle`) before being saved to the database. The server and database only store ciphertext - plaintext values never leave your device.

---

## Features

- **Client-Side AES-256-GCM Encryption**: All data fields (usernames, passwords, API tokens, 2FA codes, notes) are encrypted and decrypted locally in the browser.
- **Key Derivation (PBKDF2)**: Derives symmetric encryption keys using PBKDF2 with SHA-256 and 600,000 iterations using a cryptographically random salt.
- **Per-Field IVs**: Each sensitive field uses a unique 12-byte initialization vector (IV) to prevent ciphertext pattern analysis.
- **API Key Management**: Dedicated vault for developer keys with environment tags (production, staging, development), permission scopes, and expiration dates.
- **2FA & Recovery Codes**: Store and organize multi-line backup codes, mark single-use codes as consumed, and import/export text or CSV files.
- **Password Generator**: Configurable length (8 to 64 chars) with options for uppercase, lowercase, numbers, and symbols using cryptographically secure random values and Shannon entropy scoring.
- **Quick PIN Unlock**: Optional local device PIN protecting an in-memory session key with progressive backoff on incorrect attempts.
- **Auto-Lock Security**: Configurable session timeouts with automatic lock when switching tabs or closing the window.
- **Responsive UI**: Clean interface built with Tailwind CSS, supporting dark/light themes and accessible touch targets.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite
- **Security & Cryptography**: Native Web Crypto API (`crypto.subtle`)
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Testing**: Vitest
- **Icons & Tooling**: Lucide React, ESLint

---

## Project Structure

The codebase is organized into modular layers with strict separation of concerns:

- `src/components/`: Modular UI views, forms, and cards, following clean component boundaries.
- `src/services/`: Isolated service layer handling Supabase operations and typed results (`authService`, `credentialService`, `apiKeyService`, `securityCodeService`, `vaultService`).
- `src/hooks/`: React hooks for domain state management (`useAuth`, `useVault`, `useCredentials`, `useApiKeys`, `useSecurityCodes`, `useAutoLock`).
- `src/utils/`: Pure utility functions for Web Crypto primitives, PIN wrapping, and password generation.
- `src/types/`: Centralized TypeScript interfaces for strict typing across the application.

---

## Database Schema

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
create table if not exists vaults (
  user_id uuid references auth.users (id) on delete cascade not null primary key,
  salt text not null,
  val_iv text not null,
  val_ct text not null,
  kdf_iterations integer not null default 600000,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists credentials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  title_ct text not null,
  url_ct text,
  username_ct text not null,
  password_ct text not null,
  notes_ct text,
  ivs jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists security_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  title_ct text not null,
  codes_ct text not null,
  file_name_ct text,
  file_type_ct text,
  ivs jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  name_ct text not null,
  key_ct text not null,
  environment_ct text not null default '',
  scopes_ct text not null default '',
  expires_at_ct text not null default '',
  notes_ct text not null default '',
  ivs jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);
```

---

## Setup and Configuration

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to Project Settings -> API to copy your Project URL and anon public key.
3. Run the table schema above in the SQL Editor.

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Installation & Run

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

Open http://localhost:5173 in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Vite development server |
| `pnpm build` | Builds the production bundle to `dist/` |
| `pnpm lint` | Runs ESLint checks across the codebase |
| `pnpm typecheck` | Validates TypeScript types (`tsc --noEmit`) |
| `pnpm test` | Runs the Vitest test suite |
| `pnpm preview` | Previews the production build locally |

---

## Security Architecture

- **Client-Side Derivation**: The master password is never stored or transmitted over the network.
- **Dual Password Model**:
  - Account Password: Used for Supabase Auth to authenticate and retrieve ciphertext records.
  - Master Password: Used client-side to derive the AES-256-GCM decryption key.
- **In-Memory Clearance**: When the vault locks or the session terminates, all decrypted records and CryptoKey instances are cleared from application memory.
- **Row Level Security**: Tables are scoped per authenticated user (`auth.uid() = user_id`) so users can only access their own encrypted records.

---

## License

MIT License.
