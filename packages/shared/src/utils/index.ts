import { z } from 'zod';

export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function safeValidateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  return error.errors.reduce(
    (acc, err) => {
      const path = err.path.join('.');
      const key = path || 'root';
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(err.message);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}
