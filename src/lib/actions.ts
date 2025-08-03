
"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers, mockWords } from "./data";
import { redirect } from "next/navigation";

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
});

export async function addWord(prevState: any, formData: FormData) {
  const validatedFields = addWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }

  const { word, definition, userId } = validatedFields.data;
  const imageFile = formData.get("image") as File;

  if (!imageFile || imageFile.size === 0) {
    return {
      errors: { image: ["Image is required."] },
      message: "Validation failed.",
      success: false,
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
    
    if (!aiResult || !aiResult.options) {
        throw new Error("AI did not return valid options.");
    }
    
    console.log("AI Result:", aiResult.options);

    const newWord = {
        id: `word${Date.now()}`,
        word,
        definition,
        imageUrl: dataUri,
        options: [...aiResult.options, word],
        correctOption: word,
        supervisorId: userId,
        nextReview: new Date(),
        strength: 0,
    };

    console.log("New word to be saved:", newWord);
    mockWords.push(newWord);

    revalidatePath(`/dashboard/words`);
    

  } catch (error) {
    console.error("Error adding word:", error);
    return { message: "Failed to add word. AI generation error.", errors: {}, success: false };
  }

  redirect(`/dashboard/words?userId=${validatedFields.data.userId}`);
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
        id: role === 'supervisor' ? 'sup' + mockUsers.length : `user${Date.now()}`,
        name,
        email,
        password,
        role,
        avatar: "https://placehold.co/100x100.png",
        supervisorId: role === "student" ? validatedFields.data.supervisorId : undefined,
    };
    
    mockUsers.push(newUser);
    
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
