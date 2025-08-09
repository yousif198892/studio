
'use server';

/**
 * @fileOverview Generates a grammar quiz based on a tense name and example sentences.
 *
 * - generateGrammarQuiz - A function that generates a multiple-choice grammar quiz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  GenerateGrammarQuizInputSchema, 
  GenerateGrammarQuizOutputSchema,
  type GenerateGrammarQuizInput,
  type GenerateGrammarQuizOutput
} from '@/ai/schemas/grammar-quiz';


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

const pastSimpleExamples = `
1. I went to the park yesterday.
2. You studied for the exam.
3. We enjoyed the party last night.
4. They ate all the cookies.
5. He jumped over the fence.
6. She played tennis with her friend.
7. It ran across the road.
8. The cat ate the mouse.
9. Ali played football on Saturday.
10. We lived there for five years.
`;

const presentContinuousExamples = `
1. I am going to the store now.
2. You are studying English.
3. We are enjoying the movie.
4. They are eating lunch.
5. He is jumping on the bed.
6. She is playing the piano.
7. It is running in the garden.
8. The cat is eating its food.
9. Ali is playing video games.
10. The children are doing their homework.
`;

const tenseExamples: Record<string, string> = {
  'Present Simple': presentSimpleExamples,
  'Past Simple': pastSimpleExamples,
  'Present Continuous': presentContinuousExamples,
}

const instructionsForPresentContinuous = `
1. Create a fill-in-the-blank style question where the auxiliary verb (am, is, are) is PART of the sentence. The blank should represent the main verb in its present participle (-ing) form.
2. Provide four options: one is the correctly spelled present participle, and the other three are plausible but incorrect common misspellings of that verb. For example, for the verb 'bake', the options could be 'baking' (correct), 'bakeing', 'bakking', 'bakeng'.
`;

const instructionsForOtherTenses = `
1. Create a fill-in-the-blank style question.
2. Provide four options: one is the correct verb form for the tense, and the other three are plausible but incorrect verb forms (e.g., wrong tense, wrong conjugation).
`;


// Define the prompt with specific instructions for the AI
const prompt = ai.definePrompt({
  name: 'generateGrammarQuizPrompt',
  input: { schema: z.object({
    tense: z.string(),
    examples: z.string(),
    instructions: z.string(),
  }) },
  output: { schema: GenerateGrammarQuizOutputSchema },
  prompt: `You are an expert English teacher creating a grammar quiz. Your task is to generate 5 multiple-choice questions to test a student's understanding of the specified tense.

Tense to test: {{{tense}}}

Base the quiz on the fundamental structure and usage shown in these example sentences, but DO NOT use the exact same sentences in your questions. Create new, different sentences for the quiz.

Example sentences for the '{{{tense}}}' tense:
{{{examples}}}

For each question:
{{{instructions}}}

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
    const examples = tenseExamples[input.tense];
    if (!examples) {
        throw new Error(`Currently, quizzes for '${input.tense}' are not supported.`);
    }
    
    const instructions = input.tense === 'Present Continuous' ? instructionsForPresentContinuous : instructionsForOtherTenses;

    const { output } = await prompt({ ...input, examples, instructions });
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
