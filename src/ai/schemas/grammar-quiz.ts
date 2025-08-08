
/**
 * @fileOverview Zod schemas and TypeScript types for the grammar quiz generation feature.
 * This file does not contain server-side logic and can be safely imported by client components.
 */

import { z } from 'zod';

// Input schema for the grammar quiz generation flow
export const GenerateGrammarQuizInputSchema = z.object({
  tense: z.string().describe("The grammatical tense for the quiz, e.g., 'Present Simple'."),
});
export type GenerateGrammarQuizInput = z.infer<typeof GenerateGrammarQuizInputSchema>;


// Schema for a single multiple-choice question in the quiz
export const GrammarQuizQuestionSchema = z.object({
  questionText: z.string().describe("The text of the multiple-choice question, often a fill-in-the-blank sentence."),
  options: z.array(z.string()).length(4).describe("An array of four possible answers."),
  correctOption: z.string().describe("The correct answer from the options array."),
});
export type GrammarQuizQuestion = z.infer<typeof GrammarQuizQuestionSchema>;


// Output schema for the entire quiz
export const GenerateGrammarQuizOutputSchema = z.object({
  questions: z.array(GrammarQuizQuestionSchema).length(5).describe("An array of 5 quiz questions."),
});
export type GenerateGrammarQuizOutput = z.infer<typeof GenerateGrammarQuizOutputSchema>;
