/**
 * Cross-platform Alert utility
 * Works on web and native platforms
 */

import { Alert, Platform } from 'react-native';

export const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  if (Platform.OS === 'web') {
    // For web, use window.confirm
    if (!buttons || buttons.length === 0) {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    // If it's a confirmation dialog with 2 buttons
    if (buttons.length === 2) {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result) {
        // User clicked OK/Yes - call the second button's handler (usually the action button)
        buttons[1].onPress?.();
      } else {
        // User clicked Cancel - call the first button's handler
        buttons[0].onPress?.();
      }
    } else if (buttons.length === 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
    }
  } else {
    // For native platforms, use React Native Alert
    Alert.alert(title, message, buttons);
  }
};
