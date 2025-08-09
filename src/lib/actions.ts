
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
// The client is responsible for creating the word and saving it to IndexedDB.
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

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    supervisorId: z.string().optional(),
  });

// This action only validates the data. 
// The client will handle the actual user creation in IndexedDB.
export async function validateRegistration(prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        supervisorId: formData.get("supervisorId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
            success: false,
        };
    }
    
    const supervisorId = formData.get("supervisorId") as string;
    if (!supervisorId || supervisorId.trim() === '') {
        return {
            errors: { supervisorId: ["Supervisor ID is required."] },
            message: "Supervisor ID is required.",
            success: false,
        };
    }

    // Since we can't check the DB on the server, the client will do the final check for
    // existing email and valid supervisor ID. We just return success if fields are valid.
    return { success: true, message: "Validation successful.", formData };
}

const createSupervisorSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// This action only validates the data.
// Client handles the DB interaction.
export async function validateSupervisorCreation(prevState: any, formData: FormData) {
  const validatedFields = createSupervisorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }

  // Client will handle checking if the user exists.
  return { success: true, message: "Validation successful", formData };
}

export async function redirectToDashboard(userId: string) {
    redirect(`/dashboard?userId=${userId}`);
}
