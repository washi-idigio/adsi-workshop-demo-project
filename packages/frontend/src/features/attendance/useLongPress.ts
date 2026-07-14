"use client";

import { useCallback, useRef } from "react";

const DEFAULT_DURATION = 500;

interface UseLongPressOptions {
  duration?: number;
  onLongPress: () => void;
}

export function useLongPress({ duration = DEFAULT_DURATION, onLongPress }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const onPointerDown = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, duration);
  }, [duration, onLongPress]);

  const onPointerUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const wasLongPress = useCallback(() => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return true;
    }
    return false;
  }, []);

  return { onPointerDown, onPointerUp, wasLongPress };
}
