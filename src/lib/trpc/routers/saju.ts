import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { calculateSaju } from '@/lib/saju/saju-calculator';
import { analyzeCompatibility } from '@/lib/saju/compatibility';
import { recommendBirthDates } from '@/lib/saju/birth-date-recommender';

export const sajuRouter = createTRPCRouter({
  // Calculate saju (public - no auth needed)
  calculate: publicProcedure
    .input(z.object({
      birthDate: z.string(),
      birthTime: z.string().optional(),
    }))
    .query(({ input }) => {
      return calculateSaju(input.birthDate, input.birthTime);
    }),

  // Compatibility analysis between two people
  checkCompatibility: publicProcedure
    .input(z.object({
      person1BirthDate: z.string(),
      person1BirthTime: z.string().optional(),
      person2BirthDate: z.string(),
      person2BirthTime: z.string().optional(),
    }))
    .query(({ input }) => {
      const saju1 = calculateSaju(input.person1BirthDate, input.person1BirthTime);
      const saju2 = calculateSaju(input.person2BirthDate, input.person2BirthTime);
      return analyzeCompatibility(saju1, saju2);
    }),

  // Birth date/time recommendation for optimal saju (premium feature)
  recommendBirthDate: protectedProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      dueDate: z.string(),
      gender: z.enum(['male', 'female', 'unknown']),
    }))
    .mutation(({ input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate
        ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime)
        : undefined;
      const startDate = new Date(input.dueDate);
      startDate.setDate(startDate.getDate() - 7);
      return recommendBirthDates(parent1Saju, parent2Saju, startDate, 5);
    }),
});
