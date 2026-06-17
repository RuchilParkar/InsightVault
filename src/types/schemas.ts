import { z } from 'zod';

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Collection name is required').max(50),
  createdAt: z.number(),
});

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tag name is required').max(30),
});

export const KnowledgeItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  sourceUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  aiSummary: z.string().optional(), // Keeps backward compatibility, used as shortSummary
  shortSummary: z.string().optional(),
  detailedSummary: z.string().optional(),
  aiLearnings: z.string().optional(),
  thumbnail: z.string().optional(),
  domain: z.string().optional(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']).default('completed'),
  reasonSaved: z.string().optional(),
  isFavorite: z.boolean().default(false),
  collectionId: z.string().uuid().optional().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const SearchHistorySchema = z.object({
  id: z.string().uuid(),
  query: z.string().min(1),
  createdAt: z.number(),
});

export type Collection = z.infer<typeof CollectionSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type KnowledgeItem = z.infer<typeof KnowledgeItemSchema>;
export type SearchHistory = z.infer<typeof SearchHistorySchema>;
