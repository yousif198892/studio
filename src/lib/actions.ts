
"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers, Word, getAllUsers, User, getWordsBySupervisor } from "./data";
import { redirect } from "next/navigation";
import { translations } from "./i18n";

const t = (lang: 'en' | 'ar', key: keyof (typeof translations.en.toasts)) => {
    return translations[lang].toasts[key];
}

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  unit: z.string().optional(),
  lesson: z.string().optional(),
  image: z.instanceof(File).refine(file => file.size > 0, "Image is required."),
  existingWords: z.string(),
});

export async function addWord(prevState: any, formData: FormData) {
    const validatedFields = addWordSchema.safeParse({
        word: formData.get("word"),
        definition: formData.get("definition"),
        userId: formData.get("userId"),
        unit: formData.get("unit"),
        lesson: formData.get("lesson"),
        image: formData.get("image"),
        existingWords: formData.get("existingWords"),
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

  const { word, definition, userId, unit, lesson, image, existingWords } = validatedFields.data;
  
  const wordsForSupervisor: Word[] = JSON.parse(existingWords);
  if (wordsForSupervisor.some(w => w.word.toLowerCase() === word.toLowerCase())) {
    return {
      errors: { word: ["This word already exists in your collection."] },
      message: "This word already exists.",
      success: false,
    };
  }

  try {
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${image.type};base64,${base64}`;

    const aiResponse = await generateWordOptions({
      word,
      definition,
      explanatoryImage: dataUri,
    });
    
    if (!aiResponse?.options || aiResponse.options.length < 3) {
        throw new Error("AI did not return the expected number of options.");
    }

    const combinedOptions = [...aiResponse.options, word];
    
    const newWord: Word = {
        id: `word${Date.now()}`,
        word,
        definition,
        unit: unit || "",
        lesson: lesson || "",
        imageUrl: dataUri, 
        options: combinedOptions,
        correctOption: word,
        supervisorId: userId,
        nextReview: new Date(),
        strength: 0,
    };

    return { success: true, message: "Word created!", newWord: newWord };

  } catch (error) {
    console.error("Error during AI word option generation:", error);
    const errorMessage = "Failed to add word. The AI could not process the request. Please try a different word or image.";
    return { message: errorMessage, errors: {}, success: false };
  }
}


const updateWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  userId: z.string().min(1, "User ID is required."),
  wordId: z.string().min(1, "Word ID is required."),
  unit: z.string().optional(),
  lesson: z.string().optional(),
});

export async function updateWord(prevState: any, formData: FormData) {
  const validatedFields = updateWordSchema.safeParse({
    word: formData.get("word"),
    definition: formData.get("definition"),
    userId: formData.get("userId"),
    wordId: formData.get("wordId"),
    unit: formData.get("unit"),
    lesson: formData.get("lesson"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
      success: false,
    };
  }
   const { word, definition, wordId, unit, lesson } = validatedFields.data;
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
        unit,
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

  if (user.isSuspended) {
    return {
      errors: {},
      message: "This account has been suspended.",
    };
  }
  
  redirect(`/dashboard?userId=${user.id}`);
}

const createSupervisorSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function createSupervisor(prevState: any, formData: FormData) {
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

  const allUsers = getAllUsers();
  if (allUsers.find(u => u.email === validatedFields.data.email)) {
    return {
      errors: { email: ["Supervisor with this email already exists."] },
      message: "Supervisor with this email already exists.",
      success: false,
    };
  }

  const { name, email, password } = validatedFields.data;
  
  const newUser: User = {
      id: `sup${Date.now()}`,
      name,
      email,
      password,
      role: 'supervisor',
      avatar: "https://placehold.co/100x100.png",
      isSuspended: false,
      isMainAdmin: false,
  };
  
  return { success: true, message: "Supervisor created!", newUser };
}


const toggleSuspensionSchema = z.object({
    userToToggle: z.string().min(1, "User object is required."),
});

export async function toggleSupervisorSuspension(prevState: any, formData: FormData) {
    const validatedFields = toggleSuspensionSchema.safeParse({
        userToToggle: formData.get("userToToggle"),
    });

    if (!validatedFields.success) {
        return {
            message: "Invalid request: user object not provided.",
            success: false,
        };
    }
    
    let userToToggle: User;
    try {
        userToToggle = JSON.parse(validatedFields.data.userToToggle);
    } catch (e) {
        return { message: "Invalid user data format.", success: false };
    }

    if (!userToToggle || !userToToggle.id) {
        return { message: "User not found or invalid user data.", success: false };
    }

    const updatedUser = {
        ...userToToggle,
        isSuspended: !userToToggle.isSuspended,
    };

    return { 
        success: true, 
        message: `Supervisor ${updatedUser.isSuspended ? 'suspended' : 'unsuspended'}.`,
        updatedUser: updatedUser,
    };
}
