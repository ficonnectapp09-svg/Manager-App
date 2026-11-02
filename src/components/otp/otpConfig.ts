import { Easing } from 'react-native';

export const getOtpColors = (isDark: boolean) => {
  if (isDark) {
    return {
      bgPage: '#0B1220',
      bgCard: '#172235',
      bgBox: '#111827',
      borderNeutral: '#334155',
      borderActive: '#38BDF8',
      textPrimary: '#F8FAFC',
      textMuted: '#94A3B8',
      textPhone: '#38BDF8',
      accentEmerald: '#22C55E',
      accentGlow: '#4ADE80',
      accentFill: 'rgba(34, 197, 94, 0.15)',
      orbitTrack: 'rgba(56, 189, 248, 0.25)',
      centerDot: 'rgba(56, 189, 248, 0.8)',
      dragHandle: '#334155',
      errorRed: '#EF4444',
      errorGlow: 'rgba(239, 68, 68, 0.25)',
    };
  }
  return {
    bgPage: '#F8FAFC',
    bgCard: '#FFFFFF',
    bgBox: '#F1F5F9',
    borderNeutral: '#CBD5E1',
    borderActive: '#1D4ED8',
    textPrimary: '#0F172A',
    textMuted: '#64748B',
    textPhone: '#1D4ED8',
    accentEmerald: '#059669',
    accentGlow: '#10B981',
    accentFill: 'rgba(16, 185, 129, 0.12)',
    orbitTrack: 'rgba(29, 78, 216, 0.2)',
    centerDot: 'rgba(29, 78, 216, 0.6)',
    dragHandle: '#E2E8F0',
    errorRed: '#DC2626',
    errorGlow: 'rgba(220, 38, 38, 0.25)',
  };
};

export const OTP_CONFIG = {
  // Geometry
  BOX_SIZE: 44,
  BOX_RADIUS: 12,
  BOX_GAP: 14,
  ORBIT_RADIUS: 45,
  CENTER_SQUARE_SIZE: 40,
  CARD_RADIUS: 28,
  CARET_WIDTH: 1.5,
  CARET_HEIGHT: 20,

  BOX_PERIMETER: 155.398,
  get ARC_LENGTH() {
    return this.BOX_PERIMETER * 0.25;
  },

  COLORS: getOtpColors(false),

  // Timings (ms)
  TIMINGS: {
    CARET_BLINK: 500,
    DIGIT_POP: 180,
    ARC_SWEEP: 380,
    GATHER: 500,
    ORBIT_SPIN: 900,
    COLOR_TRANSITION: 250,
    COLLAPSE_HOLD: 250,
    COLLAPSE: 500,
    SUCCESS_RINGS: 850,
    SUCCESS_CHECK: 350,
    SUCCESS_BURST: 750,
    SUCCESS_TEXT: 400,
    SHAKE: 380,
    VERIFY_PENDING_MIN: 300,
  },

  // Easings
  EASINGS: {
    SPRING_SMOOTH: Easing.bezier(0.25, 0.1, 0.25, 1),
    SPRING_BOUNCY: Easing.bezier(0.34, 1.56, 0.64, 1),
    ACCEL: Easing.bezier(0.4, 0, 1, 1),
    DECEL: Easing.bezier(0, 0, 0.2, 1),
  },
};
