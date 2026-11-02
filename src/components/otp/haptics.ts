/**
 * Safe haptics using React Native built-in Vibration (Zero external dependency crash)
 */
import { Vibration } from 'react-native';

export const triggerHaptic = (
  _type: 'impactLight' | 'notificationSuccess' | 'notificationError'
) => {
  try {
    Vibration.vibrate(35);
  } catch {
    // safe fallback
  }
};
