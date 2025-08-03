
"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers } from "./data";
import { redirect } from "next/navigation";

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

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    role: z.enum(['student', 'supervisor']),
    supervisorId: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'student' && (!data.supervisorId || data.supervisorId.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supervisorId'],
        message: 'Supervisor ID is required for students.',
      });
    }
    if (data.role === 'student') {
        const supervisor = mockUsers.find(u => u.id === data.supervisorId && u.role === 'supervisor');
        if (!supervisor) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['supervisorId'],
                message: 'Invalid Supervisor ID.',
            });
        }
    }
  });


export async function register(prevState: any, formData: FormData) {
    const role = formData.get("role") as "student" | "supervisor";
    
    // Check for existing user first
    const email = formData.get("email") as string;
    if (mockUsers.find(u => u.email === email)) {
        return {
            errors: { email: ["User with this email already exists."] },
            message: "Registration failed.",
        };
    }

    const dataToValidate: any = {
        name: formData.get("name"),
        email: email,
        password: formData.get("password"),
        role: role,
    };

    if (role === 'student') {
        dataToValidate.supervisorId = formData.get("supervisorId");
    }

    const validatedFields = registerSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
        };
    }

    const { name, password } = validatedFields.data;
    
    const newUser = {
        id: `user${Date.now()}`,
        name,
        email,
        password,
        role,
        avatar: "https://placehold.co/100x100.png",
        supervisorId: role === "student" ? validatedFields.data.supervisorId : undefined,
    };
    
    // This won't persist across requests in dev server, but it's here for completeness.
    mockUsers.push(newUser); 
    
    // Redirect to the dashboard as the new user.
    redirect(`/dashboard?userId=${newUser.id}`);
}


const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { email, password } = validatedFields.data;

  const user = mockUsers.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return {
      errors: {},
      message: "Invalid email or password.",
    };
  }
  
  redirect(`/dashboard?userId=${user.id}`);
}
