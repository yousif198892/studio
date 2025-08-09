
/**
 * @fileOverview Zod schemas and TypeScript types for the comprehensive grammar quiz generation feature.
 */

import { z } from 'zod';
import { GrammarQuizQuestionSchema } from './grammar-quiz';

// Input schema for the comprehensive grammar quiz generation flow
export const GenerateComprehensiveQuizInputSchema = z.object({});
export type GenerateComprehensiveQuizInput = z.infer<typeof GenerateComprehensiveQuizInputSchema>;


// Output schema for the entire comprehensive quiz
export const GenerateComprehensiveQuizOutputSchema = z.object({
  questions: z.array(GrammarQuizQuestionSchema).length(9).describe("An array of 9 mixed-tense quiz questions."),
});
export type GenerateComprehensiveQuizOutput = z.infer<typeof GenerateComprehensiveQuizOutputSchema>;
