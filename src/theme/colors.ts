/**
 * FIC Mobile Application Semantic Color Palette
 * Supports Light & Professional Enterprise Dark Mode
 * Primary Brand Blue: #0B4A8B (Light) / #38BDF8 (Dark Accent)
 * Accent Brand Gold/Yellow: #F2A900
 */

export const lightColors = {
  primary: '#0B4A8B',            // FIC Deep Navy Blue
  primaryPressed: '#07325F',
  primaryDark: '#07325F',
  primaryLight: '#2C6ECB',
  secondary: '#F2A900',          // FIC Gold Yellow
  secondaryPressed: '#D49400',
  secondaryLight: '#FFF4D6',
  accent: '#F2A900',             // Alias for secondary brand yellow
  accentLight: '#FFF4D6',
  background: '#F8FAFC',         // Light slate background
  surface: '#FFFFFF',            // Card & Modal surface
  surfaceSecondary: '#F1F5F9',   // Light surface secondary
  surfaceElevated: '#FFFFFF',    // Elevated modals & dropdowns
  inputBackground: '#F1F4F8',    // Input fields & search boxes
  text: '#0F172A',               // Slate 900
  textSecondary: '#475569',      // Slate 600
  textMuted: '#94A3B8',          // Slate 400
  border: '#E2E8F0',             // Border line
  borderHighlight: '#CBD5E1',
  goldAccent: '#F2A900',
  divider: '#F1F5F9',
  success: '#10B981',            // Emerald 500
  successLight: '#D1FAE5',
  warning: '#F59E0B',            // Amber 500
  warningLight: '#FEF3C7',
  error: '#EF4444',              // Red 500
  errorLight: '#FEE2E2',
  info: '#3B82F6',               // Blue 500
  infoLight: '#DBEAFE',
  disabled: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.5)',
  
  priority: {
    low: '#2563EB',
    lowBg: '#DBEAFE',
    medium: '#D97706',
    mediumBg: '#FEF3C7',
    high: '#DC2626',
    highBg: '#FEE2E2',
  },
  
  status: {
    lead: '#6366F1',
    visited: '#8B5CF6',
    onboarded: '#10B981',
    notInterested: '#EF4444',
  }
};

export const darkColors: typeof lightColors = {
  primary: '#38BDF8',            // Bright Sky Blue (WCAG accessible against #172235 / #0B1220)
  primaryPressed: '#0284C7',
  primaryDark: '#0B1220',        // Deep dark background
  primaryLight: '#38BDF8',
  secondary: '#F2A900',          // FIC Gold Yellow
  secondaryPressed: '#D49400',
  secondaryLight: 'rgba(242, 169, 0, 0.15)',
  accent: '#F2A900',
  accentLight: 'rgba(242, 169, 0, 0.15)',
  background: '#0B1220',         // Main Dark Background (Deep Midnight Slate)
  surface: '#172235',            // Primary Cards, List Surfaces, Modals
  surfaceSecondary: '#111827',   // Secondary Dark Background
  surfaceElevated: '#1E293B',    // Elevated Surfaces (Bottom Nav, Popups, Dropdowns)
  inputBackground: '#111827',    // Dark Input Background
  text: '#F8FAFC',               // Slate 50 (High-contrast primary text)
  textSecondary: '#CBD5E1',      // Slate 300 (Readable secondary text)
  textMuted: '#94A3B8',          // Slate 400 (Muted text & placeholders)
  border: '#334155',             // Slate 700 (Subtle dark borders)
  borderHighlight: '#475569',
  goldAccent: '#F2A900',
  divider: '#1E293B',            // Subtle dark dividers
  success: '#22C55E',            // Accessible green
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',            // Accessible amber
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',              // Accessible red
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',               // Accessible info blue
  infoLight: 'rgba(56, 189, 248, 0.15)',
  disabled: '#475569',
  overlay: 'rgba(0, 0, 0, 0.75)',
  
  priority: {
    low: '#38BDF8',
    lowBg: 'rgba(56, 189, 248, 0.15)',
    medium: '#F59E0B',
    mediumBg: 'rgba(245, 158, 11, 0.15)',
    high: '#EF4444',
    highBg: 'rgba(239, 68, 68, 0.15)',
  },
  
  status: {
    lead: '#818CF8',
    visited: '#A78BFA',
    onboarded: '#34D399',
    notInterested: '#EF4444',
  }
};

// Default export preserved for backward-compatibility
export const colors = lightColors;
export type ThemeColors = typeof lightColors;
