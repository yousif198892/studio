
"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers, mockWords, Word, Unit, mockUnits, getUnitsBySupervisor } from "./data";
import { redirect } from "next/navigation";

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  unitId: z.string().min(1, "Please select a unit."),
  image: z.any(),
});

export async function addWord(prevState: any, formData: FormData) {
  const validatedFields = addWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
    unitId: formData.get("unitId"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }

  const { word, definition, userId, unitId } = validatedFields.data;
  const imageFile = formData.get("image") as File;

  if (!imageFile || imageFile.size === 0) {
    return {
      errors: { image: ["Image is required."] },
      message: "Validation failed.",
      success: false,
    };
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64}`;

    const { output } = await generateWordOptions({
      word,
      definition,
      explanatoryImage: dataUri,
    });
    
    if (!output?.options) {
        throw new Error("AI did not return valid options.");
    }

    const newWord: Word = {
        id: `word${Date.now()}`,
        word,
        definition,
        imageUrl: dataUri, 
        options: [...output.options, word],
        correctOption: word,
        supervisorId: userId,
        unitId: unitId,
        nextReview: new Date(),
        strength: 0,
    };

    return { success: true, message: "Word created!", newWord: newWord };

  } catch (error) {
    console.error("Error adding word:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to add word. AI generation error: ${errorMessage}`, errors: {}, success: false };
  }
}


const updateWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  wordId: z.string().min(1, "Word ID is required."),
  unitId: z.string().optional(),
});

export async function updateWord(prevState: any, formData: FormData) {
  const validatedFields = updateWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
    wordId: formData.get("wordId"),
    unitId: formData.get("unitId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }
   const { word, definition, wordId, unitId } = validatedFields.data;
  const imageFile = formData.get("image") as File | null;

  try {
    let dataUri: string | undefined = undefined;
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      dataUri = `data:${imageFile.type};base64,${base64}`;
    }

    return { 
      success: true, 
      message: "Word updated successfully!",
      updatedWord: {
        id: wordId,
        word,
        definition,
        unitId,
        imageUrl: dataUri,
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to update word: ${errorMessage}`, success: false };
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

const addUnitSchema = z.object({
  unitName: z.string().min(1, "Unit name is required."),
  userId: z.string().min(1, "User ID is required."),
});

export async function addUnit(prevState: any, formData: FormData) {
  const validatedFields = addUnitSchema.safeParse({
    unitName: formData.get("unitName"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }
  
  const { unitName, userId } = validatedFields.data;

  // This is a server action, so it doesn't have direct access to localStorage.
  // The check should rely on the data available to it, which is the mockUnits.
  // A robust check would require fetching from a DB. Here we simulate the check
  // against the base data. The client-side will prevent duplicates from its view.
  const existingUnit = mockUnits.find(u => u.name.toLowerCase() === unitName.toLowerCase() && u.supervisorId === userId);

  if (existingUnit) {
      return {
          errors: { unitName: ["A unit with this name already exists in the base data."] },
          message: "Unit already exists.",
          success: false,
      }
  }

  const newUnit: Unit = {
    id: `unit${Date.now()}`,
    name: unitName,
    supervisorId: userId,
  };
  
  // This just returns the unit to be saved in localStorage on the client
  return { success: true, message: "Unit created!", newUnit };
}
