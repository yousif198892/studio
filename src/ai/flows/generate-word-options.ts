// Implemented by Gemini.
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
      'A URL or data URI of an image that visually explains the word, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* Changed from URL to data URI */
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

export async function generateWordOptions(
  input: GenerateWordOptionsInput
): Promise<GenerateWordOptionsOutput> {
  return generateWordOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordOptionsPrompt',
  input: {schema: GenerateWordOptionsInputSchema},
  output: {schema: GenerateWordOptionsOutputSchema},
  prompt: `You are an AI assistant helping teachers create vocabulary quizzes.

  Given a vocabulary word, its definition, and an explanatory image, your task is to generate three incorrect, but contextually relevant, answer options.
  These options should be plausible enough to challenge students, but definitively wrong.

  Word: {{{word}}}
  Definition: {{{definition}}}
  Image: {{media url=explanatoryImage}}

  Options:`,
});

const generateWordOptionsFlow = ai.defineFlow(
  {
    name: 'generateWordOptionsFlow',
    inputSchema: GenerateWordOptionsInputSchema,
    outputSchema: GenerateWordOptionsOutputSchema,
  },
  async input => {
    // The AI model can't handle the full data URI.
    // Let's modify the prompt to just use the description and word.
    const modifiedInput = {
      ...input,
      // Create a prompt that doesn't rely on the image.
      prompt: `You are an AI assistant helping teachers create vocabulary quizzes.

      Given a vocabulary word and its definition, your task is to generate three incorrect, but contextually relevant, answer options.
      These options should be plausible enough to challenge students, but definitively wrong.
    
      Word: ${input.word}
      Definition: ${input.definition}
    
      Options:`,
    };

    const {output} = await prompt(modifiedInput);
    return output!;
  }
);