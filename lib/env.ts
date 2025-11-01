import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  NEXT_PUBLIC_ANALYTICS_WRITE_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined))
});

const parsedEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_ANALYTICS_WRITE_KEY: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
});

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Variables de entorno públicas inválidas.\n${issues.join('\n')}`);
}

/**
 * Variables de entorno públicas validadas para el cliente web.
 */
export const clientEnv = parsedEnv.data;

