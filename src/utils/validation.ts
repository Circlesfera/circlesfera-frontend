// Utilidades de validación para el frontend

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: unknown, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Validación requerida
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('Este campo es requerido');
    return { isValid: false, errors };
  }

  // Si el campo está vacío y no es requerido, es válido
  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }

  const stringValue = value.toString();

  // Validación de longitud mínima
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Debe tener al menos ${rules.minLength} caracteres`);
  }

  // Validación de longitud máxima
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`No puede exceder ${rules.maxLength} caracteres`);
  }

  // Validación de patrón
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push('Formato inválido');
  }

  // Validación personalizada
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForm = (data: Record<string, unknown>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: string[] = [];
  let isValid = true;

  for (const [field, value] of Object.entries(data)) {
    if (rules[field]) {
      const result = validateField(value, rules[field]);
      if (!result.isValid) {
        isValid = false;
        errors.push(...result.errors.map(error => `${field}: ${error}`));
      }
    }
  }

  return { isValid, errors };
};

// Reglas de validación comunes
export const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  fullName: {
    maxLength: 50,
  },
  bio: {
    maxLength: 160,
  },
  website: {
    pattern: /^https?:\/\/.+/,
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
};

// Validadores específicos
export const validateUsername = (username: string): ValidationResult => {
  return validateField(username, validationRules.username);
};

export const validateEmail = (email: string): ValidationResult => {
  return validateField(email, validationRules.email);
};

export const validatePassword = (password: string): ValidationResult => {
  return validateField(password, validationRules.password);
};

export const validateWebsite = (website: string): ValidationResult => {
  return validateField(website, validationRules.website);
};

export const validatePhone = (phone: string): ValidationResult => {
  return validateField(phone, validationRules.phone);
};

// Validación de archivos
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
}): ValidationResult => {
  const errors: string[] = [];

  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`El archivo no puede exceder ${Math.round(options.maxSize / 1024 / 1024)}MB`);
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${options.allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sanitización de datos
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const sanitizeUsername = (username: string): string => {
  return username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};
