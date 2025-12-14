// hooks/useVoiceRecorder.ts
import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  }, [recording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};