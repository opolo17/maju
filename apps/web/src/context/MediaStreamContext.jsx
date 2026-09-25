import { createContext, useContext } from 'react';
import { useMediaStream } from '../hooks/useMediaStream.js';

const MediaStreamContext = createContext(null);

export function MediaStreamProvider({ children }) {
  const value = useMediaStream({ enabled: true });
  return (
    <MediaStreamContext.Provider value={value}>{children}</MediaStreamContext.Provider>
  );
}

export function useSharedMediaStream() {
  const context = useContext(MediaStreamContext);
  if (!context) {
    throw new Error('useSharedMediaStream must be used within MediaStreamProvider');
  }
  return context;
}
