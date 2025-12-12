// Sound utility for playing audio feedback

import { Audio } from 'expo-av';

let completionSound: Audio.Sound | null = null;

// Initialize sound - load the completion sound file
export const initializeSound = async () => {
  try {
    // Set audio mode to play even in silent mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Load the completion sound
    // Note: require() must be used directly, not wrapped in { uri: }
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/completion.ogg'),
      { shouldPlay: false }
    );
    completionSound = sound;
    console.log('✅ Completion sound loaded successfully');
  } catch (error) {
    console.error('Failed to initialize completion sound:', error);
    console.log('Completion sound will be unavailable');
  }
};

// Play completion sound when a task is marked as done
export const playCompletionSound = async () => {
  try {
    if (completionSound) {
      // Replay from beginning
      await completionSound.setPositionAsync(0);
      await completionSound.playAsync();
    } else {
      console.warn('Completion sound not loaded');
    }
  } catch (error) {
    console.warn('Failed to play completion sound:', error);
  }
};
