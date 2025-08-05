
'use server';

/**
 * @fileOverview Generates contextually relevant but incorrect answer options for vocabulary questions.
 *
 * - generateWordOptions - A function that generates incorrect word options.
 * - GenerateWordOptionsInput - The input type for the generateWordOptions function.
 * - GenerateWordOptionsOutput - The return type for the generateWordOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordOptionsInputSchema = z.object({
  word: z.string().describe('The vocabulary word for which to generate options.'),
  definition: z.string().describe('The definition of the vocabulary word.'),
  explanatoryImage: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateWordOptionsInput = z.infer<typeof GenerateWordOptionsInputSchema>;

const GenerateWordOptionsOutputSchema = z.object({
  options: z
    .array(z.string())
    .length(3)
    .describe('Three contextually similar but incorrect answer options.'),
});
export type GenerateWordOptionsOutput = z.infer<typeof GenerateWordOptionsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateWordOptionsPrompt',
  input: {schema: GenerateWordOptionsInputSchema},
  output: {schema: GenerateWordOptionsOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an AI assistant helping teachers create vocabulary quizzes.

  Given a vocabulary word, its definition, and an explanatory image, your task is to generate three incorrect, but contextually relevant, answer options.
  These options should be plausible enough to challenge students, but definitively wrong. The options should not be simple variations of the correct word.

  Word: {{{word}}}
  Definition: {{{definition}}}
  Image: {{media url=explanatoryImage}}

  Generate three incorrect options based on the provided information. Your output must be a JSON object with a single key "options" containing an array of three strings.`,
});

export async function generateWordOptions(
  input: GenerateWordOptionsInput
): Promise<GenerateWordOptionsOutput> {
  const {output} = await prompt(input);
  if (!output) {
    throw new Error('AI failed to generate word options.');
  }
  return output;
}
