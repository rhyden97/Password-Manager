import { describe, it, expect } from 'vitest';
import { parseSecurityCodes, formatSecurityCodes } from './securityCodeParser';

describe('securityCodeParser', () => {
  it('parses single-line space-separated codes (user request format)', () => {
    const input = 'AMR3 1B84 1VMX HM4S 1K9E DJ54 N2Y1 Y2B4';
    const result = parseSecurityCodes(input);
    expect(result).toEqual([
      'AMR3',
      '1B84',
      '1VMX',
      'HM4S',
      '1K9E',
      'DJ54',
      'N2Y1',
      'Y2B4',
    ]);
    expect(formatSecurityCodes(input)).toBe(
      'AMR3\n1B84\n1VMX\nHM4S\n1K9E\nDJ54\nN2Y1\nY2B4'
    );
  });

  it('parses comma and semicolon separated codes', () => {
    const input = 'AMR3, 1B84; 1VMX,HM4S';
    const result = parseSecurityCodes(input);
    expect(result).toEqual(['AMR3', '1B84', '1VMX', 'HM4S']);
  });

  it('parses tab-separated table copies', () => {
    const input = 'AMR3\t1B84\n1VMX\tHM4S';
    const result = parseSecurityCodes(input);
    expect(result).toEqual(['AMR3', '1B84', '1VMX', 'HM4S']);
  });

  it('parses numbered and bulleted lists', () => {
    const input = `1. AMR3
2) 1B84
- 1VMX
* HM4S
[ ] 1K9E
[x] DJ54`;
    const result = parseSecurityCodes(input);
    expect(result).toEqual(['AMR3', '1B84', '1VMX', 'HM4S', '1K9E', 'DJ54']);
  });

  it('preserves Google 8-digit codes formatted with a space on individual lines', () => {
    const input = `1234 5678
8765 4321`;
    const result = parseSecurityCodes(input);
    expect(result).toEqual(['1234 5678', '8765 4321']);
  });

  it('preserves hyphenated codes', () => {
    const input = '1a2b-3c4d  5e6f-7g8h  9i0j-1k2l';
    const result = parseSecurityCodes(input);
    expect(result).toEqual(['1a2b-3c4d', '5e6f-7g8h', '9i0j-1k2l']);
  });

  it('handles empty or whitespace-only inputs gracefully', () => {
    expect(parseSecurityCodes('')).toEqual([]);
    expect(parseSecurityCodes('   \n\t  ')).toEqual([]);
  });
});
