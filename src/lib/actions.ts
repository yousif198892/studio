
'use server';

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { Word, getAllUsers, User } from "./data";
import { redirect } from "next/navigation";
import { translations } from "./i18n";

const t = (lang: 'en' | 'ar', key: keyof (typeof translations.en.toasts)) => {
    return translations[lang].toasts[key];
}

// This is no longer a form action, but a simple callable server function.
const addWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  imageDataUri: z.string().min(1, "Image data is required."),
});

export async function addWord(data: {
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
        
        // Return only the incorrect options. The correct option is the word itself.
        return { success: true, options: aiResponse.options };

    } catch (error) {
        console.error("Error during word creation:", error);
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


const registerSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    role: z.enum(['student']),
    supervisorId: z.string().optional(),
  });


export async function register(prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: "student",
        supervisorId: formData.get("supervisorId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
        };
    }
    
    const { name, email, password, supervisorId } = validatedFields.data;

    const allUsers = getAllUsers();
    
    if (allUsers.some(u => u.email === email)) {
      return {
        errors: { email: ["User with this email already exists."] },
        message: "User with this email already exists.",
      };
    }

    if (!supervisorId || supervisorId.trim() === '') {
        return {
            errors: { supervisorId: ["Supervisor ID is required."] },
            message: "Supervisor ID is required.",
        };
    }

    const supervisorExists = allUsers.some(u => u.id === supervisorId && u.role === 'supervisor');
    if (!supervisorExists) {
         return {
            errors: { supervisorId: ["Invalid Supervisor ID."] },
            message: "Invalid Supervisor ID.",
        };
    }
    
    const newUser: User = {
        id: `user${Date.now()}`,
        name,
        email,
        password,
        role: 'student',
        avatar: "https://placehold.co/100x100.png",
        supervisorId: supervisorId,
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
  
  const allUsers = getAllUsers();

  const user = allUsers.find((u) => u.email === email);

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
