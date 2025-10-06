import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
}

interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  isValidating: boolean;
  validate: (data: Partial<T>) => boolean;
  handleSubmit: (data: T) => Promise<void>;
  clearErrors: () => void;
  setFieldError: (field: keyof T, message: string) => void;
}

/**
 * Hook personalizado para validación de formularios con Zod
 * @param options - Opciones de configuración
 * @returns Funciones y estado para manejar validación
 */
export function useFormValidation<T>({
  schema,
  onSubmit
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValidating, setIsValidating] = useState(false);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const validate = useCallback((data: Partial<T>): boolean => {
    try {
      schema.parse(data);
      clearErrors();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};

        error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as keyof T;
          if (field) {
            fieldErrors[field] = err.message;
          }
        });

        setErrors(fieldErrors);
      }
      return false;
    }
  }, [schema, clearErrors]);

  const handleSubmit = useCallback(async (data: T) => {
    setIsValidating(true);
    clearErrors();

    try {
      // Validar datos
      schema.parse(data);

      // Si la validación pasa, ejecutar onSubmit
      await onSubmit(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};

        error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as keyof T;
          if (field) {
            fieldErrors[field] = err.message;
          }
        });

        setErrors(fieldErrors);
      }
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [schema, onSubmit, clearErrors]);

  return {
    errors,
    isValidating,
    validate,
    handleSubmit,
    clearErrors,
    setFieldError
  };
}

