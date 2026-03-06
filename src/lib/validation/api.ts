import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1),
  size: z.string().min(1),
  image: z.string().url(),
  quantity: z.number().int().positive(),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(6).max(120),
  cart: z.array(cartItemSchema).min(1),
  formData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    phone: z.string().min(3),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
  }),
});

export const replySchema = z.object({
  messageId: z.string().uuid(),
  email: z.email(),
  subject: z.string().min(1).max(200),
  replyText: z.string().min(1).max(5000),
  originalDate: z.string().min(1),
  originalMessage: z.string().min(1).max(5000),
});

export const statusUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  orderId: z.string().uuid(),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered"]),
});

export const adminOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered"]),
});

export const adminMessageStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["Unread", "Read", "Replied"]),
});

export const adminProductSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional().default(""),
  details: z.array(z.string()).default([]),
  image: z.string().url(),
  image_back: z.string().url(),
});
