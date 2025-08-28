
/**
 * @fileOverview Zod schemas and TypeScript types for the prepositions of place quiz.
 */

import { z } from 'zod';

// Input schema for the prepositions quiz generation flow
export const GeneratePrepositionsQuizInputSchema = z.object({});
export type GeneratePrepositionsQuizInput = z.infer<typeof GeneratePrepositionsQuizInputSchema>;


// Schema for a single multiple-choice question in the quiz
export const PrepositionsQuizQuestionSchema = z.object({
  questionText: z.string().describe("The text of the multiple-choice question, a fill-in-the-blank sentence."),
  options: z.array(z.string()).length(3).describe("An array of three possible answers: 'in', 'on', 'at'."),
  correctOption: z.string().describe("The correct answer from the options array."),
});
export type PrepositionsQuizQuestion = z.infer<typeof PrepositionsQuizQuestionSchema>;


// Output schema for the entire quiz
export const GeneratePrepositionsQuizOutputSchema = z.object({
  questions: z.array(PrepositionsQuizQuestionSchema).length(10).describe("An array of 10 quiz questions."),
});
export type GeneratePrepositionsQuizOutput = z.infer<typeof GeneratePrepositionsQuizOutputSchema>;
