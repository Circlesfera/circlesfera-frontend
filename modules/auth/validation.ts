import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z.string().min(3, 'Introduce tu correo o nombre de usuario'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  email: z.string().email('Introduce un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  displayName: z.string().min(2, 'Introduce tu nombre público').max(64, 'Nombre demasiado largo'),
  handle: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(32, 'El usuario es demasiado largo')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos')
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

