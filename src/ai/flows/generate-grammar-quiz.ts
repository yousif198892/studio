
'use server';

/**
 * @fileOverview Generates a grammar quiz based on a tense name and example sentences.
 *
 * - generateGrammarQuiz - A function that generates a multiple-choice grammar quiz.
 * - GenerateGrammarQuizInput - The input type for the generateGrammarQuiz function.
 * - GenerateGrammarQuizOutput - The return type for the generateGrammarQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define schemas for structured input and output
const GenerateGrammarQuizInputSchema = z.object({
  tense: z.string().describe("The grammatical tense for the quiz, e.g., 'Present Simple'."),
});
export type GenerateGrammarQuizInput = z.infer<typeof GenerateGrammarQuizInputSchema>;

export const GrammarQuizQuestionSchema = z.object({
  questionText: z.string().describe("The text of the multiple-choice question, often a fill-in-the-blank sentence."),
  options: z.array(z.string()).length(4).describe("An array of four possible answers."),
  correctOption: z.string().describe("The correct answer from the options array."),
});
export type GrammarQuizQuestion = z.infer<typeof GrammarQuizQuestionSchema>;

const GenerateGrammarQuizOutputSchema = z.object({
  questions: z.array(GrammarQuizQuestionSchema).length(5).describe("An array of 5 quiz questions."),
});
export type GenerateGrammarQuizOutput = z.infer<typeof GenerateGrammarQuizOutputSchema>;


const presentSimpleExamples = `
1. I go to school every day.
2. You study hard.
3. We enjoy ourselves.
4. They eat apples.
5. Hadi and Huda leave home at 7:30.
6. He jumps high.
7. She plays tennis.
8. It runs fast.
9. The cat eats a mouse.
10. Ali plays football.
`;

// Define the prompt with specific instructions for the AI
const prompt = ai.definePrompt({
  name: 'generateGrammarQuizPrompt',
  input: { schema: GenerateGrammarQuizInputSchema },
  output: { schema: GenerateGrammarQuizOutputSchema },
  prompt: `You are an expert English teacher creating a grammar quiz. Your task is to generate 5 multiple-choice questions to test a student's understanding of the specified tense.

  Tense to test: {{{tense}}}

  Base the quiz on the fundamental structure and usage shown in these example sentences, but DO NOT use the exact same sentences in your questions. Create new, different sentences for the quiz.
  
  Example sentences for the '{{{tense}}}' tense:
  ${presentSimpleExamples}

  For each question:
  1. Create a fill-in-the-blank style question.
  2. Provide four options: one is the correct verb form for the tense, and the other three are plausible but incorrect verb forms (e.g., wrong tense, wrong conjugation).
  3. Ensure the correct answer is one of the four options.
  4. The output must be a JSON object containing a 'questions' array with exactly 5 question objects.
  `,
});


// Define the internal flow function
const generateGrammarQuizFlow = ai.defineFlow(
  {
    name: 'generateGrammarQuizFlow',
    inputSchema: GenerateGrammarQuizInputSchema,
    outputSchema: GenerateGrammarQuizOutputSchema,
  },
  async (input) => {
    // For now, we only have Present Simple, but this could be expanded.
    if (input.tense !== 'Present Simple') {
        throw new Error("Currently, only 'Present Simple' quizzes are supported.");
    }
    
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate quiz questions.');
    }
    return output;
  }
);

// Export a simple async wrapper function for the server action
export async function generateGrammarQuiz(input: GenerateGrammarQuizInput): Promise<GenerateGrammarQuizOutput> {
    return generateGrammarQuizFlow(input);
}
