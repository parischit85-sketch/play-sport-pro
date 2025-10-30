/**
 * Validation Schemas con Zod
 * Validazione input centralizzata per sicurezza e consistenza
 */

import { z } from 'zod';

/**
 * Schema base per ID
 */
export const idSchema = z.string().min(1, 'ID is required').max(100);

/**
 * Schema per email
 */
export const emailSchema = z.string().email('Invalid email format').max(255, 'Email too long');

/**
 * Schema per password
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Schema per nome utente
 */
export const displayNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z0-9\s\u00C0-\u024F'-]+$/, 'Name contains invalid characters');

/**
 * Schema per numero telefono
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

/**
 * Schema per URL
 */
export const urlSchema = z.string().url('Invalid URL format').max(2048, 'URL too long').optional();

/**
 * Schema per data (ISO string)
 */
export const dateSchema = z.string().datetime('Invalid date format').or(z.date());

/**
 * Schema per orario (HH:MM)
 */
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)');

/**
 * Schema per durata in minuti
 */
export const durationSchema = z
  .number()
  .int('Duration must be an integer')
  .min(15, 'Minimum duration is 15 minutes')
  .max(480, 'Maximum duration is 8 hours');

/**
 * Schema User
 */
export const userSchema = z.object({
  uid: idSchema,
  email: emailSchema,
  displayName: displayNameSchema,
  photoURL: urlSchema,
  phoneNumber: phoneSchema,
  emailVerified: z.boolean().optional(),
  disabled: z.boolean().optional(),
  createdAt: z.number().optional(),
  lastLogin: z.number().optional(),
});

/**
 * Schema User Registration
 */
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  phoneNumber: phoneSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions',
  }),
});

/**
 * Schema User Update
 */
export const userUpdateSchema = z.object({
  displayName: displayNameSchema.optional(),
  photoURL: urlSchema,
  phoneNumber: phoneSchema,
  bio: z.string().max(500, 'Bio too long').optional(),
  preferences: z
    .object({
      notifications: z.boolean().optional(),
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Schema Club
 */
export const clubSchema = z.object({
  id: idSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  province: z.string().length(2, 'Province code must be 2 characters'),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
  phone: phoneSchema,
  email: emailSchema,
  website: urlSchema,
  logo: urlSchema,
  coverImage: urlSchema,
  sports: z.array(z.string()).min(1, 'At least one sport required'),
  facilities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  openingHours: z
    .object({
      monday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      tuesday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      wednesday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      thursday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      friday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      saturday: z.object({ open: timeSchema, close: timeSchema }).optional(),
      sunday: z.object({ open: timeSchema, close: timeSchema }).optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

/**
 * Schema Court
 */
export const courtSchema = z.object({
  id: idSchema,
  clubId: idSchema,
  name: z.string().min(1).max(100),
  sport: z.string().min(2).max(50),
  surface: z.string().min(2).max(50).optional(),
  indoor: z.boolean().default(false),
  lighting: z.boolean().default(false),
  hourlyRate: z.number().min(0).max(1000),
  isActive: z.boolean().default(true),
  capacity: z.number().int().min(2).max(100).optional(),
  features: z.array(z.string()).optional(),
});

/**
 * Schema Booking
 */
export const bookingSchema = z
  .object({
    id: idSchema.optional(),
    clubId: idSchema,
    courtId: idSchema,
    userId: idSchema,
    date: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    duration: durationSchema,
    players: z.array(z.string()).min(1).max(20),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
    paymentStatus: z.enum(['pending', 'paid', 'refunded']).default('pending'),
    totalAmount: z.number().min(0).max(10000),
    notes: z.string().max(500).optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .refine(
    (data) => {
      // Validazione custom: endTime > startTime
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

/**
 * Schema Booking Creation
 */
export const createBookingSchema = bookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  paymentStatus: true,
});

/**
 * Schema Match
 */
export const matchSchema = z
  .object({
    id: idSchema.optional(),
    clubId: idSchema,
    courtId: idSchema,
    sport: z.string().min(2).max(50),
    player1Id: idSchema,
    player2Id: idSchema,
    date: dateSchema,
    startTime: timeSchema,
    duration: durationSchema,
    status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).default('scheduled'),
    score: z
      .object({
        player1: z.number().int().min(0).max(99),
        player2: z.number().int().min(0).max(99),
      })
      .optional(),
    winner: z.enum(['player1', 'player2', 'draw']).optional(),
    eloChange: z
      .object({
        player1: z.number().int(),
        player2: z.number().int(),
      })
      .optional(),
    notes: z.string().max(500).optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .refine(
    (data) => {
      // Validazione custom: player1 ≠ player2
      return data.player1Id !== data.player2Id;
    },
    {
      message: 'Players must be different',
      path: ['player2Id'],
    }
  );

/**
 * Schema Payment
 */
export const paymentSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  clubId: idSchema,
  bookingId: idSchema.optional(),
  amount: z.number().min(0.01).max(10000),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  method: z.enum(['card', 'cash', 'bank-transfer', 'paypal', 'stripe']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).default('pending'),
  transactionId: z.string().optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.number().optional(),
  completedAt: z.number().optional(),
});

/**
 * Schema Notification
 */
export const notificationSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  type: z.enum(['booking', 'match', 'payment', 'system', 'social']),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.any()).optional(),
  read: z.boolean().default(false),
  actionUrl: z.string().optional(),
  createdAt: z.number().optional(),
});

/**
 * Schema Email
 */
export const emailSchema = z
  .object({
    to: z.union([emailSchema, z.array(emailSchema).min(1).max(100)]),
    cc: z.array(emailSchema).max(50).optional(),
    bcc: z.array(emailSchema).max(50).optional(),
    subject: z.string().min(1).max(500),
    text: z.string().max(10000).optional(),
    html: z.string().max(50000).optional(),
    attachments: z
      .array(
        z.object({
          filename: z.string().max(255),
          content: z.string(),
          encoding: z.string().optional(),
        })
      )
      .max(10)
      .optional(),
  })
  .refine(
    (data) => {
      // Almeno uno tra text e html deve essere presente
      return data.text || data.html;
    },
    {
      message: 'Either text or html content is required',
      path: ['text'],
    }
  );

/**
 * Utility: Valida e parse input
 */
export function validate(schema, data) {
  try {
    return {
      success: true,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    throw error;
  }
}

/**
 * Utility: Valida async (per backend)
 */
export async function validateAsync(schema, data) {
  try {
    const result = await schema.parseAsync(data);
    return {
      success: true,
      data: result,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    throw error;
  }
}

/**
 * Middleware validazione per Express
 */
export function validateMiddleware(schema) {
  return async (req, res, next) => {
    const result = await validateAsync(schema, req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors,
      });
    }

    req.validatedData = result.data;
    next();
  };
}
