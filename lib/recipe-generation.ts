import { z } from "zod";

export const ingredientCategories = [
  "主食",
  "肉类",
  "海鲜",
  "蔬菜",
  "水果",
  "蛋奶",
  "豆制品",
  "调味",
  "其他",
] as const;

export const generatedDishSchema = z.object({
  name: z.string().trim().min(1).max(40),
  desc: z.string().trim().min(1).max(80),
  emoji: z.string().trim().min(1).max(8),
  minutes: z.number().int().min(5).max(240),
  calories: z.number().int().min(0).max(5000),
  protein: z.number().min(0).max(300),
  cost: z.number().min(0).max(500),
  tags: z.array(z.string().trim().min(1).max(12)).min(1).max(4),
  ingredients: z.array(z.object({
    name: z.string().trim().min(1).max(40),
    qty: z.string().trim().min(1).max(30),
    category: z.enum(ingredientCategories),
  })).min(1).max(30),
  steps: z.array(z.string().trim().min(1).max(240)).min(2).max(12),
});

export const generatedDishBatchSchema = z.object({
  dishes: z.array(generatedDishSchema).min(1).max(20),
});

export type GeneratedDish = z.infer<typeof generatedDishSchema>;
