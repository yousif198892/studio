
'use server';

import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { redirect } from "next/navigation";

// --- WORD ACTIONS ---

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  imageDataUri: z.string().min(1, "Image data is required."),
});

// This action ONLY calls the AI and returns the options.
// The client is responsible for creating the word and saving it to storage.
export async function getAiWordOptions(data: {
    word: string;
    definition: string;
    imageDataUri: string;
}) {
    const validatedFields = addWordSchema.safeParse(data);

    if (!validatedFields.success) {
        const errorMap = validatedFields.error.flatten().fieldErrors;
        const firstError = Object.values(errorMap)[0]?.[0] || "Validation failed.";
        return {
            errors: errorMap,
            message: firstError,
            success: false,
            options: null,
        };
    }
  
    try {
        const aiResponse = await generateWordOptions({
            word: data.word,
            definition: data.definition,
            explanatoryImage: data.imageDataUri,
        });

        if (!aiResponse?.options || aiResponse.options.length < 3) {
            throw new Error("AI did not return the expected number of options.");
        }
        
        return { success: true, options: aiResponse.options, message: "" };

    } catch (error) {
        console.error("Error during word option generation:", error);
        const errorMessage = "Failed to add word. The AI could not process the request. Please try a different word or image.";
        return { message: errorMessage, success: false, options: null };
    }
}

// --- AUTH ACTIONS ---

export async function redirectToDashboard(userId: string) {
    redirect(`/dashboard?userId=${userId}`);
}
