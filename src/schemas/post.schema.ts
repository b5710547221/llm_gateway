import { z } from 'zod'

// Post schemas
export const postSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean(),
  authorId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').optional(),
  published: z.boolean().default(false),
  authorId: z.string().cuid('Invalid author ID'),
})

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
})

export type Post = z.infer<typeof postSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
