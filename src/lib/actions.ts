
"use server";

import { revalidatePath } from "next/cache";
import { generateWordOptions } from "@/ai/flows/generate-word-options";
import { z } from "zod";
import { mockUsers, mockWords, Word, Unit, mockUnits, getUnitsBySupervisor } from "./data";
import { redirect } from "next/navigation";

const addWordSchema = z.object({
  word: z.string().min(1, "الكلمة مطلوبة."),
  definition: z.string().min(1, "التعريف مطلوب."),
  userId: z.string().min(1, "معرف المستخدم مطلوب."),
  unitId: z.string().min(1, "يرجى تحديد وحدة."),
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
      message: "فشل التحقق.",
      success: false,
    };
  }

  const { word, definition, userId, unitId } = validatedFields.data;
  const imageFile = formData.get("image") as File;

  if (!imageFile || imageFile.size === 0) {
    return {
      errors: { image: ["الصورة مطلوبة."] },
      message: "فشل التحقق.",
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
        throw new Error("لم يرجع الذكاء الاصطناعي خيارات صالحة.");
    }

    const newWord: Word = {
        id: `word${Date.now()}`,
        word,
        definition,
        imageUrl: dataUri, 
        options: [...aiResponse.options, word],
        correctOption: word,
        supervisorId: userId,
        unitId: unitId,
        nextReview: new Date(),
        strength: 0,
    };

    return { success: true, message: "تم إنشاء الكلمة!", newWord: newWord };

  } catch (error) {
    console.error("خطأ في إضافة كلمة:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    return { message: `فشل إضافة الكلمة. خطأ في إنشاء الذكاء الاصطناعي: ${errorMessage}`, errors: {}, success: false };
  }
}


const updateWordSchema = z.object({
  word: z.string().min(1, "الكلمة مطلوبة."),
  definition: z.string().min(1, "التعريف مطلوب."),
  userId: z.string().min(1, "معرف المستخدم مطلوب."),
  wordId: z.string().min(1, "معرف الكلمة مطلوب."),
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
      message: "فشل التحقق.",
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
      message: "تم تحديث الكلمة بنجاح!",
      updatedWord: {
        id: wordId,
        word,
        definition,
        unitId,
        imageUrl: dataUri,
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    return { message: `فشل تحديث الكلمة: ${errorMessage}`, success: false };
  }
}


const registerSchema = z
  .object({
    name: z.string().min(1, 'الاسم مطلوب.'),
    email: z.string().email('عنوان البريد الإلكتروني غير صالح.'),
    password: z.string().min(6, 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'),
    role: z.enum(['student', 'supervisor']),
    supervisorId: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'student' && (!data.supervisorId || data.supervisorId.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supervisorId'],
        message: 'معرف المشرف مطلوب للطلاب.',
      });
    }
    if (data.role === 'student') {
        const supervisor = mockUsers.find(u => u.id === data.supervisorId && u.role === 'supervisor');
        if (!supervisor) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['supervisorId'],
                message: 'معرف المشرف غير صالح.',
            });
        }
    }
  });


export async function register(prevState: any, formData: FormData) {
    const role = formData.get("role") as "student" | "supervisor";
    
    const email = formData.get("email") as string;
    if (mockUsers.find(u => u.email === email)) {
        return {
            errors: { email: ["مستخدم بهذا البريد الإلكتروني موجود بالفعل."] },
            message: "فشل التسجيل.",
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
            message: "فشل التحقق.",
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
  email: z.string().email("عنوان البريد الإلكتروني غير صالح."),
  password: z.string().min(1, "كلمة المرور مطلوبة."),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "فشل التحقق.",
    };
  }

  const { email, password } = validatedFields.data;

  const user = mockUsers.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return {
      errors: {},
      message: "بريد إلكتروني أو كلمة مرور غير صالحة.",
    };
  }
  
  redirect(`/dashboard?userId=${user.id}`);
}

const addUnitSchema = z.object({
  unitName: z.string().min(1, "اسم الوحدة مطلوب."),
  userId: z.string().min(1, "معرف المستخدم مطلوب."),
});

export async function addUnit(prevState: any, formData: FormData) {
  const validatedFields = addUnitSchema.safeParse({
    unitName: formData.get("unitName"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "فشل التحقق.",
      success: false,
    };
  }
  
  const { unitName, userId } = validatedFields.data;

  // In a real app, this check would happen against a database
  const allUnits = getUnitsBySupervisor(userId);
  const existingUnit = allUnits.find(u => u.name.toLowerCase() === unitName.toLowerCase());


  if (existingUnit) {
      return {
          errors: { unitName: ["وحدة بهذا الاسم موجودة بالفعل."] },
          message: "الوحدة موجودة بالفعل.",
          success: false,
      }
  }

  const newUnit: Unit = {
    id: `unit${Date.now()}`,
    name: unitName,
    supervisorId: userId,
  };
  
  return { success: true, message: "تم إنشاء الوحدة!", newUnit };
}
