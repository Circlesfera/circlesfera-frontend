"use client";

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

// Removed unused interface FormField

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

interface FormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceValidation?: number;
}

/**
 * Hook optimizado para manejo de formularios
 * Incluye validación debounced, estado optimizado y mejor rendimiento
 */
export const useOptimizedForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  debounceValidation = 300
}: FormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación debounced para mejor rendimiento
  const debouncedValues = useDebounce(values, debounceValidation);

  // Validación optimizada
  const validateForm = useCallback((valuesToValidate: T): Partial<Record<keyof T, string>> => {
    if (!validate) return {};
    return validate(valuesToValidate);
  }, [validate]);

  // Actualizar valores del formulario
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setDirty(prev => ({ ...prev, [field]: true }));

    if (validateOnChange) {
      const newValues = { ...values, [field]: value };
      const newErrors = validateForm(newValues);
      setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof T] || null }));
    }
  }, [values, validateForm, validateOnChange]);

  // Manejar blur de campos
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      const newErrors = validateForm(values);
      setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof T] || null }));
    }
  }, [values, validateForm, validateOnBlur]);

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Marcar todos los campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    // Validar formulario completo
    const formErrors = validateForm(values);
    setErrors(formErrors);

    // Si hay errores, no enviar
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Estado calculado optimizado
  const formState = useMemo((): FormState<T> => {
    const hasErrors = Object.values(errors).some(error => error !== null);
    const hasDirtyFields = Object.values(dirty).some(isDirty => isDirty);

    return {
      values,
      errors,
      touched,
      dirty,
      isValid: !hasErrors,
      isDirty: hasDirtyFields,
      isSubmitting
    };
  }, [values, errors, touched, dirty, isSubmitting]);

  // Validación automática cuando cambian los valores debounced
  useMemo(() => {
    if (validateOnChange && debounceValidation > 0) {
      const newErrors = validateForm(debouncedValues);
      setErrors(newErrors);
    }
  }, [debouncedValues, validateForm, validateOnChange, debounceValidation]);

  return {
    ...formState,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};

/**
 * Hook para campos de formulario individuales
 */
export const useFormField = <T>(
  name: keyof T,
  formState: FormState<T>,
  setValue: (field: keyof T, value: any) => void,
  setFieldTouched: (field: keyof T) => void
) => {
  const value = formState.values[name];
  const error = formState.errors[name];
  const touched = formState.touched[name] || false;
  const dirty = formState.dirty[name] || false;

  const handleChange = useCallback((newValue: any) => {
    setValue(name, newValue);
  }, [name, setValue]);

  const handleBlur = useCallback(() => {
    setFieldTouched(name);
  }, [name, setFieldTouched]);

  return {
    value,
    error,
    touched,
    dirty,
    handleChange,
    handleBlur,
    hasError: touched && error !== null
  };
};

/**
 * Hook para validaciones comunes
 */
export const useValidation = () => {
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Email inválido';
  }, []);

  const validateRequired = useCallback((value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Este campo es requerido';
    }
    return null;
  }, []);

  const validateMinLength = useCallback((value: string, minLength: number) => {
    if (value.length < minLength) {
      return `Debe tener al menos ${minLength} caracteres`;
    }
    return null;
  }, []);

  const validateMaxLength = useCallback((value: string, maxLength: number) => {
    if (value.length > maxLength) {
      return `No debe exceder ${maxLength} caracteres`;
    }
    return null;
  }, []);

  const validatePassword = useCallback((password: string) => {
    const minLength = validateMinLength(password, 8);
    if (minLength) return minLength;

    if (!/[A-Z]/.test(password)) {
      return 'Debe contener al menos una mayúscula';
    }

    if (!/[a-z]/.test(password)) {
      return 'Debe contener al menos una minúscula';
    }

    if (!/[0-9]/.test(password)) {
      return 'Debe contener al menos un número';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Debe contener al menos un carácter especial';
    }

    return null;
  }, [validateMinLength]);

  return {
    validateEmail,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validatePassword
  };
};
