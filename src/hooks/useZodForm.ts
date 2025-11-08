import { useCallback, useMemo, useState } from 'react';

type ZodSchema<T> = { safeParse: (data: T) => { success: true } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } } };

export function useZodForm<T extends Record<string, unknown>>(schema: ZodSchema<T>, initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = useMemo(() => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }, [schema, values]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setValues(initial), [initial]);

  return { values, setField, errors, isValid, reset };
}


