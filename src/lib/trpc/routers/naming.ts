import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { generateNames } from '@/lib/naming/name-generator';
import { analyzeName } from '@/lib/naming/name-analyzer';
import { reviewName } from '@/lib/naming/name-reviewer';
import { generateTaemyeong } from '@/lib/naming/taemyeong-generator';
import { generateEnglishNames } from '@/lib/naming/english-name-generator';
import { calculateSaju } from '@/lib/saju/saju-calculator';

export const namingRouter = createTRPCRouter({
  generateNames: protectedProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      babyBirthDate: z.string().optional(),
      babyBirthTime: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;
      const babySaju = input.babyBirthDate ? calculateSaju(input.babyBirthDate, input.babyBirthTime) : parent1Saju;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      const { data: request } = await ctx.supabase
        .from('naming_requests')
        .insert({
          user_id: ctx.user.id,
          parent1_saju: parent1Saju,
          parent2_saju: parent2Saju,
          baby_birth_date: input.babyBirthDate,
          baby_birth_time: input.babyBirthTime,
          gender: input.gender,
          hangryeol_char: input.hangryeolChar,
          sibling_names: input.siblingNames,
        })
        .select()
        .single();

      const { data: result } = await ctx.supabase
        .from('naming_results')
        .insert({
          request_id: request?.id,
          suggested_names: names,
        })
        .select()
        .single();

      return { names, requestId: request?.id, resultId: result?.id };
    }),

  analyzeName: protectedProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string(),
      resultId: z.string(),
      parent1BirthDate: z.string(),
      parent2BirthDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate) : undefined;

      const report = await analyzeName(input.name, input.hanja, parent1Saju, parent1Saju, parent2Saju);

      const { data } = await ctx.supabase
        .from('naming_reports')
        .insert({
          result_id: input.resultId,
          user_id: ctx.user.id,
          selected_name: input.name,
          selected_hanja: input.hanja,
          report_data: report,
          price_paid: 1000,
        })
        .select()
        .single();

      return { report, reportId: data?.id };
    }),

  reviewName: protectedProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string().optional(),
      birthDate: z.string(),
      birthTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { calculateSaju } = await import('@/lib/saju/saju-calculator');
      const sajuResult = calculateSaju(input.birthDate, input.birthTime);
      const review = await reviewName(input.name, input.hanja || '', sajuResult);

      await ctx.supabase.from('naming_reviews').insert({
        user_id: ctx.user.id,
        input_name: input.name,
        input_hanja: input.hanja,
        quick_result: review,
      });

      return review;
    }),

  generateTaemyeong: protectedProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent2BirthDate: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate) : undefined;
      return generateTaemyeong(parent1Saju, parent2Saju, input.gender);
    }),

  generateEnglishNames: protectedProcedure
    .input(z.object({
      koreanName: z.string(),
      hanja: z.string().optional(),
      gender: z.string(),
      options: z.array(z.enum(['similar_sound', 'similar_meaning', 'same_initial', 'global_popular', 'custom'])),
      customPrompt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return generateEnglishNames(
        input.koreanName,
        input.hanja || '',
        input.gender,
        input.options,
        input.customPrompt
      );
    }),

  generateNamesPublic: publicProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      babyBirthDate: z.string().optional(),
      babyBirthTime: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      return { names, resultId: 'guest' };
    }),
});
