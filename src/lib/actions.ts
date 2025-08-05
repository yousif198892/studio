

"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers, Word, Unit, mockUnits, getUnitsBySupervisor, getAllUsers, User } from "./data";
import { redirect } from "next/navigation";
import { translations } from "./i18n";

const t = (lang: 'en' | 'ar', key: keyof (typeof translations.en.toasts)) => {
    return translations[lang].toasts[key];
}

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  unitId: z.string().min(1, "Please select a unit."),
  lesson: z.string().optional(),
  image: z.any(),
});

export async function addWord(prevState: any, formData: FormData) {
  const validatedFields = addWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
    unitId: formData.get("unitId"),
    lesson: formData.get("lesson"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errorMap)[0]?.[0] || "Validation failed.";
    
    return {
      errors: errorMap,
      message: firstError,
      success: false,
    };
  }

  const { word, definition, userId, unitId, lesson } = validatedFields.data;
  const imageFile = formData.get("image") as File;

  if (!imageFile || imageFile.size === 0) {
    return {
      errors: { image: ["Image is required."] },
      message: "Image is required.",
      success: false,
    };
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64}`;

    const aiResponse = await generateWordOptions({
      word,
      definition,
      explanatoryImage: dataUri,
    });
    
    if (!aiResponse?.options) {
        throw new Error("AI did not return valid options.");
    }

    const combinedOptions = [...aiResponse.options, word];
    const uniqueOptions = Array.from(new Set(combinedOptions));


    const newWord: Word = {
        id: `word${Date.now()}`,
        word,
        definition,
        imageUrl: dataUri, 
        options: uniqueOptions,
        correctOption: word,
        supervisorId: userId,
        unitId: unitId,
        lesson: lesson,
        nextReview: new Date(),
        strength: 0,
    };

    return { success: true, message: "Word created!", newWord: newWord };

  } catch (error) {
    console.error("Error adding word:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed to add word. AI Generation Error: ${errorMessage}`, errors: {}, success: false };
  }
}


const updateWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  wordId: z.string().min(1, "Word ID is required."),
  unitId: z.string().min(1, "Please select a unit."),
  lesson: z.string().optional(),
});

export async function updateWord(prevState: any, formData: FormData) {
  const validatedFields = updateWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
    wordId: formData.get("wordId"),
    unitId: formData.get("unitId"),
    lesson: formData.get("lesson"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }
   const { word, definition, wordId, unitId, lesson } = validatedFields.data;
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
        lesson,
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

    const allUsers = getAllUsers();
    if (allUsers.find(u => u.email === email)) {
      return {
        errors: { email: ["User with this email already exists."] },
        message: "User with this email already exists.",
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
        const errorMap = validatedFields.error.flatten().fieldErrors;
        const firstError = Object.values(errorMap)[0]?.[0] || "Validation failed.";
        return {
            errors: errorMap,
            message: firstError,
        };
    }

    const { name, password } = validatedFields.data;
    
    const newUser = {
        id: role === 'supervisor' ? `sup${Date.now()}` : `user${Date.now()}`,
        name,
        email,
        password,
        role,
        avatar: "https://placehold.co/100x100.png",
        supervisorId: role === "student" ? validatedFields.data.supervisorId : undefined,
    };
    
    const userParam = encodeURIComponent(JSON.stringify(newUser));
    redirect(`/welcome?user=${userParam}`);
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
  
  const dynamicUsersString = formData.get('dynamicUsers') as string | null;
  const dynamicUsers = dynamicUsersString ? JSON.parse(dynamicUsersString) : [];
  
  const allUsers = [...mockUsers, ...dynamicUsers];
  const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.id, user])).values());

  const user = uniqueUsers.find((u) => u.email === email);

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

  const allUnits = getUnitsBySupervisor(userId);
  const existingUnit = allUnits.find(u => u.name.toLowerCase() === unitName.toLowerCase());


  if (existingUnit) {
      return {
          errors: { unitName: ["Unit with this name already exists."] },
          message: "Unit already exists.",
          success: false,
      }
  }

  const newUnit: Unit = {
    id: `unit${Date.now()}`,
    name: unitName,
    supervisorId: userId,
  };
  
  return { success: true, message: "Unit created!", newUnit };
}
