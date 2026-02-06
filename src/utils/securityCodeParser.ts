export function parseSecurityCodes(raw: string): string[] {
  if (!raw || !raw.trim()) return [];

  const normalized = raw.replace(/[,;]+/g, '\n');
  const lines = normalized.split(/\r?\n/);
  const results: string[] = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    line = line
      .replace(/^\[[ xX]\]\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^\d+[.)]\s*/, '')
      .replace(/^\[\d+\]\s*/, '')
      .trim();

    if (!line) continue;

    line = line.replace(/^["'`]|["'`]$/g, '').trim();
    if (!line) continue;

    if (line.includes('\t')) {
      const parts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);
      results.push(...parts);
      continue;
    }

    if (/\s{2,}/.test(line)) {
      const parts = line.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
      results.push(...parts);
      continue;
    }

    const tokens = line.split(/\s+/).map((t) => t.trim()).filter(Boolean);

    if (tokens.length <= 1) {
      results.push(tokens[0]);
    } else if (tokens.length === 2 && /^\d{4}$/.test(tokens[0]) && /^\d{4}$/.test(tokens[1])) {
      results.push(`${tokens[0]} ${tokens[1]}`);
    } else {
      results.push(...tokens);
    }
  }

  return results.map((c) => c.trim()).filter((c) => c.length > 0);
}

export function formatSecurityCodes(raw: string): string {
  return parseSecurityCodes(raw).join('\n');
}
