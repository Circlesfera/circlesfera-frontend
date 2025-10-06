import { z } from 'zod';

/**
 * Schema de validación para actualización de perfil
 */
export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(1, 'El nombre completo es requerido')
    .max(100, 'El nombre completo no puede exceder 100 caracteres')
    .optional(),

  bio: z.string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),

  website: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),

  location: z.string()
    .max(100, 'La ubicación no puede exceder 100 caracteres')
    .optional(),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido')
    .optional()
    .or(z.literal('')),

  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'])
    .optional(),

  birthDate: z.string()
    .optional()
});

/**
 * Schema de validación para cambio de contraseña
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida'),

  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),

  confirmPassword: z.string()
    .min(1, 'Confirma tu nueva contraseña')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

/**
 * Schema de validación para configuración de privacidad
 */
export const privacySettingsSchema = z.object({
  isPrivate: z.boolean(),
  allowMessages: z.enum(['all', 'followers', 'none']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showBirthDate: z.boolean()
});

/**
 * Schema de validación para configuración de notificaciones
 */
export const notificationSettingsSchema = z.object({
  likes: z.boolean(),
  comments: z.boolean(),
  follows: z.boolean(),
  mentions: z.boolean(),
  messages: z.boolean(),
  stories: z.boolean(),
  posts: z.boolean()
});

/**
 * Schema de validación para configuración de seguridad
 */
export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  loginNotifications: z.boolean(),
  suspiciousActivityAlerts: z.boolean()
});

// Tipos TypeScript derivados de los schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;

