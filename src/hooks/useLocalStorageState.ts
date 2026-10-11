import { useEffect, useState } from 'react';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue; // getItem may return null
      const parsed = JSON.parse(raw);

      // لو المخزن "null" أو رجّع null فعلياً، رجّع القيمة الافتراضية
      if (parsed === null || parsed === undefined) return initialValue;

      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
