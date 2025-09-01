import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2', 'py-4', 'bg-blue-500');
    expect(result).toBe('px-2 py-4 bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    
    expect(result).toBe('base-class active-class');
  });

  it('handles arrays of classes', () => {
    const result = cn(['px-2', 'py-4'], 'bg-blue-500');
    expect(result).toBe('px-2 py-4 bg-blue-500');
  });

  it('overrides Tailwind classes correctly', () => {
    // Should keep the last padding value
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('handles empty strings', () => {
    const result = cn('', 'px-2', '', 'py-4');
    expect(result).toBe('px-2 py-4');
  });

  it('merges complex Tailwind utilities correctly', () => {
    const result = cn(
      'text-red-500 hover:text-blue-500',
      'text-green-500'
    );
    // The last text color should win
    expect(result).toBe('hover:text-blue-500 text-green-500');
  });

  it('returns empty string when no arguments provided', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles object notation for conditional classes', () => {
    const result = cn({
      'px-4': true,
      'py-2': true,
      'bg-red-500': false,
      'bg-blue-500': true
    });
    
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });
});