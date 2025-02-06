import { useState, useCallback, useEffect } from 'react';
export const useCountdown = (startTime: number, onEnd?: () => any) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(startTime);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(startTime);
  }, [startTime]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (timeRemaining === 0) {
      onEnd?.();
      return;
    }

    if (isRunning) {
      timeout = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  });

  return { timeRemaining, start, reset, isRunning };
};
