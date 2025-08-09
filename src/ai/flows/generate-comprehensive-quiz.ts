
'use server';

/**
 * @fileOverview Generates a comprehensive grammar quiz covering multiple tenses.
 *
 * - generateComprehensiveQuiz - A function that generates a mixed-tense grammar quiz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  GenerateComprehensiveQuizInputSchema, 
  GenerateComprehensiveQuizOutputSchema,
  type GenerateComprehensiveQuizInput,
  type GenerateComprehensiveQuizOutput
} from '@/ai/schemas/comprehensive-quiz';

const presentSimpleExamples = `
- I go to school every day.
- She plays tennis.
- They eat apples.
`;

const pastSimpleExamples = `
- I went to the park yesterday.
- He jumped over the fence.
- We lived there for five years.
`;

const presentContinuousExamples = `
- I am going to the store now.
- You are studying English.
- The children are doing their homework.
`;

// Define the prompt with specific instructions for the AI
const prompt = ai.definePrompt({
  name: 'generateComprehensiveQuizPrompt',
  input: { schema: z.object({
    presentSimple: z.string(),
    pastSimple: z.string(),
    presentContinuous: z.string(),
  }) },
  output: { schema: GenerateComprehensiveQuizOutputSchema },
  prompt: `You are an expert English teacher creating a comprehensive grammar quiz. Your task is to generate 9 multiple-choice questions to test a student's ability to differentiate between the Present Simple, Past Simple, and Present Continuous tenses.

Create exactly 3 questions for each tense. The questions should be mixed together, not grouped by tense.

Use these example sentences as a reference for the structure of each tense, but DO NOT use the exact same sentences.
Present Simple Examples:
{{{presentSimple}}}

Past Simple Examples:
{{{pastSimple}}}

Present Continuous Examples:
{{{presentContinuous}}}

For each question:
1. Create a fill-in-the-blank style question.
2. For "Present Continuous" questions, the auxiliary verb (am, is, are) should be PART of the sentence, and the blank should be the main verb. The options should be four different spellings of the present participle (e.g., "baking", "bakeing", "bakking", "bakeng").
3. For "Present Simple" and "Past Simple" questions, the options should be different verb forms (e.g., "go", "goes", "went", "going").
4. Ensure one option is correct and the other three are plausible but incorrect.
5. The final output must be a JSON object containing a 'questions' array with exactly 9 question objects.
`,
});


// Define the internal flow function
const generateComprehensiveQuizFlow = ai.defineFlow(
  {
    name: 'generateComprehensiveQuizFlow',
    inputSchema: GenerateComprehensiveQuizInputSchema,
    outputSchema: GenerateComprehensiveQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
        presentSimple: presentSimpleExamples,
        pastSimple: pastSimpleExamples,
        presentContinuous: presentContinuousExamples,
    });
    if (!output) {
      throw new Error('AI failed to generate comprehensive quiz questions.');
    }
    return output;
  }
);

// Export a simple async wrapper function for the server action
export async function generateComprehensiveQuiz(input: GenerateComprehensiveQuizInput): Promise<GenerateComprehensiveQuizOutput> {
    return generateComprehensiveQuizFlow(input);
}
