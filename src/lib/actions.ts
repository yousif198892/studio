"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers } from "./data";

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
});

// In a real app, you'd get this from the user's session
const MOCK_SUPERVISOR_ID = "sup1";

export async function addWord(prevState: any, formData: FormData) {
  const validatedFields = addWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { word, definition } = validatedFields.data;
  const imageFile = formData.get("image") as File;

  if (!imageFile || imageFile.size === 0) {
    return {
      errors: { image: ["Image is required."] },
      message: "Validation failed.",
    };
  }

  try {
    // Convert image to data URI to pass to GenAI flow
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64}`;

    console.log(`Generating options for "${word}"...`);

    const aiResult = await generateWordOptions({
      word,
      definition,
      explanatoryImage: dataUri,
    });
    
    console.log("AI Result:", aiResult.options);

    // Here you would save the new word to your database
    // For now, we'll just log it.
    const newWord = {
        id: `word${Date.now()}`,
        word,
        definition,
        imageUrl: dataUri, // In real app, you'd upload to storage and save URL
        options: [...aiResult.options, word],
        correctOption: word,
        supervisorId: MOCK_SUPERVISOR_ID,
        nextReview: new Date(),
        strength: 0,
    };

    console.log("New word to be saved:", newWord);
    // mockWords.push(newWord); // This won't persist across requests on the server

    revalidatePath("/dashboard/add-word");
    revalidatePath("/dashboard/words");

    return { message: `Successfully added word: ${word}`, errors: {} };
  } catch (error) {
    console.error("Error adding word:", error);
    return { message: "Failed to add word. AI generation error.", errors: {} };
  }
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["student", "supervisor"]),
  supervisorId: z.string().optional(),
});

export async function register(prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        supervisorId: formData.get("supervisorId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
        };
    }

    const { name, email, role, supervisorId } = validatedFields.data;

    // In a real app, you would save the new user to your database
    const newUser = {
        id: `user${Date.now()}`,
        name,
        email,
        role,
        avatar: "https://placehold.co/100x100.png",
        supervisorId: role === "student" ? supervisorId : undefined,
    };

    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
        return {
            errors: { email: ["User with this email already exists."] },
            message: "Registration failed.",
        };
    }
    
    console.log("New user to be saved:", newUser);
    // mockUsers.push(newUser); // This won't persist across requests on the server

    revalidatePath("/register");
    return { message: "Registration successful!", errors: {} };
}
