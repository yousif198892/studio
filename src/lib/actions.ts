

'use server';

import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { redirect } from "next/navigation";
import { addUserDB, getAllUsers, getUserByEmailDB, getUserById } from "./data";
import { User } from "./data";

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

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    supervisorId: z.string().optional(),
  });

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
    
    // Server-side check if user exists
    const existingUser = await getUserByEmailDB(validatedFields.data.email);
    if(existingUser) {
        return {
            errors: { email: ["User with this email already exists."] },
            message: "User with this email already exists.",
            success: false,
        }
    }
    
    // Server-side check if supervisor exists
    const supervisor = await getUserById(supervisorId);
    if (!supervisor || supervisor.role !== 'supervisor') {
         return {
            errors: { supervisorId: ["Invalid Supervisor ID provided."] },
            message: "Invalid Supervisor ID provided.",
            success: false,
        };
    }

    const newUser: User = {
        id: `user${Date.now()}`,
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        role: 'student',
        avatar: "https://placehold.co/100x100.png",
        supervisorId: supervisorId,
    };
    
    await addUserDB(newUser);
    
    redirect(`/dashboard?userId=${newUser.id}`);
}

const createSupervisorSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

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
  
  const existingUser = await getUserByEmailDB(validatedFields.data.email);
   if(existingUser) {
        return {
            errors: { email: ["Supervisor with this email already exists."] },
            message: "Supervisor with this email already exists.",
            success: false,
        }
    }

  const newSupervisor: User = {
      id: `sup${Date.now()}`,
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      role: 'supervisor',
      avatar: "https://placehold.co/100x100.png",
      isSuspended: false,
      isMainAdmin: false,
  };
  
  await addUserDB(newSupervisor);
  
  return { success: true, message: "Validation successful", newUser: newSupervisor };
}

export async function redirectToDashboard(userId: string) {
    redirect(`/dashboard?userId=${userId}`);
}
