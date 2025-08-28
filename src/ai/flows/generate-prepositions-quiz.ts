
'use server';

/**
 * @fileOverview Generates a grammar quiz for prepositions of place (in, on, at).
 *
 * - generatePrepositionsQuiz - A function that generates the quiz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  GeneratePrepositionsQuizInputSchema, 
  GeneratePrepositionsQuizOutputSchema,
  type GeneratePrepositionsQuizInput,
  type GeneratePrepositionsQuizOutput
} from '@/ai/schemas/prepositions-quiz';

const places = [
    "roads", "home", "school", "office", "building site", 
    "restaurant", "hospital", "oil refinery", "farm", "mall"
];

const specificInstructions = `
- For "office", the correct preposition must be "in".
- For "building site", the correct preposition must be "on".
- For "restaurant", the correct preposition must be "in".
- For "oil refinery", the correct preposition must be "in".
- For "farm", the correct preposition must be "on".
- For "hospital", the correct preposition must be "in".
`;

// Define the prompt with specific instructions for the AI
const prompt = ai.definePrompt({
  name: 'generatePrepositionsQuizPrompt',
  input: { schema: z.object({ places: z.array(z.string()), instructions: z.string() }) },
  output: { schema: GeneratePrepositionsQuizOutputSchema },
  prompt: `You are an expert English teacher creating a grammar quiz about prepositions of place.
Your task is to generate exactly 10 multiple-choice questions to test a student's ability to use "in", "on", and "at".

Use each of the following places in exactly one question:
{{{places}}}

For each question:
1. Create a natural-sounding, fill-in-the-blank style sentence.
2. The blank must be correctly filled by one of "in", "on", or "at".
3. The options for every question must be exactly ["in", "on", "at"].
4. Ensure you provide the single correct option for each sentence.
5. Adhere to these specific rules for certain places:
{{{instructions}}}

The final output must be a JSON object containing a 'questions' array with exactly 10 question objects.
`,
});


// Define the internal flow function
const generatePrepositionsQuizFlow = ai.defineFlow(
  {
    name: 'generatePrepositionsQuizFlow',
    inputSchema: GeneratePrepositionsQuizInputSchema,
    outputSchema: GeneratePrepositionsQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ places, instructions: specificInstructions });
    if (!output) {
      throw new Error('AI failed to generate prepositions quiz questions.');
    }
    // The AI is asked for 3 options, but we need to ensure it's always 'in', 'on', 'at'
    const validatedQuestions = output.questions.map(q => ({
      ...q,
      options: ["in", "on", "at"],
    }));

    return { questions: validatedQuestions };
  }
);

// Export a simple async wrapper function for the server action
export async function generatePrepositionsQuiz(input: GeneratePrepositionsQuizInput): Promise<GeneratePrepositionsQuizOutput> {
    return generatePrepositionsQuizFlow(input);
}
