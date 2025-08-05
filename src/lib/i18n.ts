
export const translations = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      learn: "Learn",
      myWords: "My Words",
      masteredWords: "Mastered Words",
      addWord: "Add Word",
      myUnits: "My Units",
      myStudents: "My Students",
      profile: "Profile",
    },
    profile: {
        title: "My Profile",
        personalInfo: {
            title: "Personal Information",
            description: "Update your personal details here.",
            picture: "Profile Picture",
            fullName: "Full Name",
            email: "Email",
            save: "Save Changes",
        },
        preferences: {
            title: "Preferences",
            description: "Customize your learning experience.",
            language: "Language",
            selectLanguage: "Select Language",
            timezone: "Timezone",
            selectTimezone: "Select timezone",
            fontSize: "Font Size",
            selectFontSize: "Select font size",
            fontSmall: "Small",
            fontDefault: "Default",
            fontLarge: "Large",
            save: "Save Preferences",
        },
        account: {
            title: "Account Management",
            description: "Manage your account settings and data.",
            resetPassword: {
                title: "Reset Password",
                description: "You will be sent an email with instructions to reset your password.",
                button: "Reset Password",
            },
            deleteAccount: {
                title: "Delete Account",
                description: "Permanently delete your account and all associated data. This action cannot be undone.",
                button: "Delete My Account",
            },
        },
    },
    login: {
        welcome: "Welcome Back!",
        description: "Enter your email below to login to your account.",
        emailLabel: "Email",
        passwordLabel: "Password",
        forgotPassword: "Forgot your password?",
        loginButton: "Login",
        loginWithGoogle: "Login with Google",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
    },
    register: {
        title: "Join LinguaLeap",
        description: "Create your account to start your learning journey.",
        studentTab: "Student",
        supervisorTab: "Supervisor",
        fullNameLabel: "Full Name",
        fullNamePlaceholder: "Max Robinson",
        emailLabel: "Email",
        emailPlaceholder: "m@example.com",
        passwordLabel: "Password",
        supervisorIdLabel: "Supervisor ID",
        supervisorIdPlaceholder: "Enter your supervisor's ID",
        createAccountButton: "Create an account",
        createSupervisorAccountButton: "Create supervisor account",
        orContinueWith: "Or continue with",
        registerWithGoogle: "Register with Google",
        haveAccount: "Already have an account?",
        login: "Login",
    },
    landing: {
        title: "Leap into Language with AI",
        description: "LinguaLeap combines proven learning techniques with cutting-edge AI to create a personalized, effective vocabulary-building experience.",
        getStarted: "Start Learning Now",
        login: "Login",
        features: {
            title: "Why LinguaLeap Works",
            description: "We've engineered the perfect blend of technology and pedagogy to accelerate your language acquisition.",
            aiQuizzes: {
                title: "AI-Powered Quizzes",
                description: "Challenge yourself with AI-generated incorrect options, making learning more effective and engaging."
            },
            supervisorTools: {
                title: "Supervisor Tools",
                description: "Supervisors can add custom vocabulary and track student progress, tailoring the learning experience."
            },
            srs: {
                title: "Spaced Repetition",
                description: "Our smart algorithm schedules reviews at optimal intervals to lock words into your long-term memory."
            }
        },
        footer: {
            copyright: "© 2024 LinguaLeap. All rights reserved.",
            terms: "Terms of Service",
            privacy: "Privacy",
        }
    },
    learn: {
        title: "Learning Session",
        question: "Which word means: “{0}”?",
        nextWord: "Next Word",
        iKnowIt: "I Know It",
        backToDashboard: "Back to Dashboard",
        finishedTitle: "All done for now!",
        finishedDescription1: "You've reviewed all your due words. Great work!",
        finishedDescription2: "Come back later for your next session.",
        startNewSession: "Start a new session anyway",
        wordStrength: "Word Strength",
    },
    dashboard: {
        student: {
            welcome: "Welcome, {0}!",
            description: "Here's a summary of your learning progress. Keep up the great work!",
            reviewTitle: "Words to Review",
            reviewDescription: "Ready for your next session",
            learnedTitle: "Words in Learning",
            learnedDescription: "Actively learning via SRS",
            masteredTitle: "Mastered Words",
            masteredDescription: "Words moved to long-term memory",
        },
        supervisor: {
            title: "Supervisor Dashboard",
            welcome: "Welcome, {0}.",
            supervisorId: {
                title: "Your Supervisor ID",
                description: "Share this ID with your students so they can connect with you."
            },
            myStudents: {
                title: "My Students",
                description: "A list of students under your supervision.",
                name: "Name",
                email: "Email"
            }
        },
        loading: "Loading..."
    },
    addWord: {
        title: "Add a New Word",
        description: "Create a new vocabulary card for your students. AI will automatically generate distractor options.",
        cardTitle: "New Vocabulary Card",
        cardDescription: "Fill in the details for the new word.",
        form: {
            wordLabel: "Word",
            wordPlaceholder: "e.g., Ephemeral",
            definitionLabel: "Definition",
            definitionPlaceholder: "e.g., Lasting for a very short time.",
            unitLabel: "Unit",
            selectUnit: "Select a Unit",
            imageLabel: "Explanatory Image",
            addButton: "Add Word",
            addingButton: "Adding Word...",
        }
    },
    editWord: {
        title: "Edit Word",
        description: "Update the details for your vocabulary card.",
        cardTitle: "Editing: {0}",
        cardDescription: "Modify the fields below and save your changes.",
        form: {
            currentImage: "Current Image:",
            imageHelper: "Leave blank to keep the current image.",
            saveButton: "Save Changes",
            savingButton: "Saving Changes...",
        }
    },
    wordsPage: {
        title: "My Learned Words",
        myLearnedWordsDesc: "Review and manage the words you are actively learning.",
        description: "Browse and manage your vocabulary cards.",
        addNew: "Add New Word",
        table: {
            title: "My Word Collection",
            description: "A complete list of all words you've added.",
            image: "Image",
            word: "Word",
            definition: "Definition",
            unit: "Unit",
            actions: "Actions",
            nextReview: "Next Review",
            reviewOverdue: "Overdue",
            reviewToday: "Today",
            reviewTomorrow: "Tomorrow",
            reviewInDays: "In {0} days",
        },
        deleteDialog: {
            title: "Are you absolutely sure?",
            description: "This action cannot be undone. This will permanently delete the word “{0}” from your list.",
            cancel: "Cancel",
            continue: "Continue",
        },
        resetDialog: {
            title: "Are you sure you want to reset this word?",
            description: "This will reset the learning progress for “{0}” and move it back to your review queue.",
            continue: "Reset",
        },
        wontForgetButton: "I Won't Forget",
        wontForgetDialog: {
            title: "Move to Mastered Words?",
            description: "This will remove “{0}” from your regular review schedule. You can restore it later from the Mastered Words page.",
            continue: "Confirm",
        }
    },
    masteredWordsPage: {
        title: "Mastered Words",
        description: "Words you've completely learned. They are no longer in your review schedule.",
        badge: "Mastered",
        restoreDialog: {
            title: "Restore to Learning?",
            description: "This will add “{0}” back to your learning queue for review.",
            continue: "Restore"
        }
    },
    unitsPage: {
        title: "My Units",
        description: "Manage your vocabulary units.",
        allUnits: {
            title: "All Units",
            description: "A list of all your vocabulary units.",
            name: "Unit Name",
            actions: "Actions",
        },
        addUnit: {
            title: "Add New Unit",
            description: "Create a new unit to categorize your words.",
            form: {
                nameLabel: "Unit Name",
                namePlaceholder: "e.g., Chapter 1 Verbs",
                addButton: "Add Unit",
                addingButton: "Adding Unit...",
            }
        },
        deleteDialog: {
            description: "This action cannot be undone. This will permanently delete the unit “{0}”. You will need to re-assign any words in this unit.",
        }
    },
    studentsPage: {
        title: "My Students",
        description: "Welcome, {0}. Here are your students.",
        allStudents: {
            title: "All Students",
            description: "A list of students under your supervision.",
        },
    },
    toasts: {
        error: "Error",
        success: "Success!",
        addUnitSuccess: "Unit created!",
        addUnitExists: "Unit already exists.",
        addWordSuccess: "Word created!",
        updateWordSuccess: "Word updated successfully!",
        deleteWordSuccess: "Word deleted successfully.",
        resetWordSuccess: "“{0}” progress has been reset.",
        restoreWordSuccess: "“{0}” has been restored to your learning queue.",
        rescheduleSuccess: "“{0}” has been rescheduled.",
        wontForgetText: "“{0}” moved to Mastered Words.",
        validationFailed: "Validation failed.",
        aiError: "Failed to add word. AI Generation Error: {0}",
        registerSuccess: "Success!",
        loginError: "Invalid email or password.",
        supervisorIdRequired: "Supervisor ID is required for students.",
        invalidSupervisorId: "Invalid Supervisor ID.",
        userExists: "User with this email already exists.",
        passwordLength: "Password must be at least 6 characters.",
        nameRequired: "Name is required.",
        invalidEmail: "Invalid email address.",
        unitRequired: "Please select a unit.",
        definitionRequired: "Definition is required.",
        wordRequired: "Word is required.",
        imageRequired: "Image is required."
    }
  },
  ar: {
    sidebar: {
      dashboard: "لوحة التحكم",
      learn: "تعلم",
      myWords: "كلماتي",
      masteredWords: "الكلمات المتقنة",
      addWord: "إضافة كلمة",
      myUnits: "وحداتي",
      myStudents: "طلابي",
      profile: "الملف الشخصي",
    },
    profile: {
        title: "ملفي الشخصي",
        personalInfo: {
            title: "المعلومات الشخصية",
            description: "قم بتحديث تفاصيلك الشخصية هنا.",
            picture: "الصورة الشخصية",
            fullName: "الاسم الكامل",
            email: "البريد الإلكتروني",
            save: "حفظ التغييرات",
        },
        preferences: {
            title: "التفضيلات",
            description: "خصص تجربتك التعليمية.",
            language: "اللغة",
            selectLanguage: "اختر اللغة",
            timezone: "المنطقة الزمنية",
            selectTimezone: "اختر المنطقة الزمنية",
            fontSize: "حجم الخط",
            selectFontSize: "اختر حجم الخط",
            fontSmall: "صغير",
            fontDefault: "افتراضي",
            fontLarge: "كبير",
            save: "حفظ التفضيلات",
        },
        account: {
            title: "إدارة الحساب",
            description: "قم بإدارة إعدادات حسابك وبياناتك.",
            resetPassword: {
                title: "إعادة تعيين كلمة المرور",
                description: "سيتم إرسال بريد إلكتروني إليك يحتوي على تعليمات لإعادة تعيين كلمة المرور الخاصة بك.",
                button: "إعادة تعيين كلمة المرور",
            },
            deleteAccount: {
                title: "حذف الحساب",
                description: "حذف حسابك وجميع البيانات المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
                button: "حذف حسابي",
            },
        },
    },
    login: {
        welcome: "مرحبًا بعودتك!",
        description: "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك.",
        emailLabel: "البريد الإلكتروني",
        passwordLabel: "كلمة المرور",
        forgotPassword: "هل نسيت كلمة المرور؟",
        loginButton: "تسجيل الدخول",
        loginWithGoogle: "تسجيل الدخول باستخدام جوجل",
        noAccount: "ليس لديك حساب؟",
        signUp: "التسجيل",
    },
    register: {
        title: "انضم إلى LinguaLeap",
        description: "أنشئ حسابك لبدء رحلتك التعليمية.",
        studentTab: "طالب",
        supervisorTab: "مشرف",
        fullNameLabel: "الاسم الكامل",
        fullNamePlaceholder: "ماكس روبنسون",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "m@example.com",
        passwordLabel: "كلمة المرور",
        supervisorIdLabel: "معرف المشرف",
        supervisorIdPlaceholder: "أدخل معرف المشرف الخاص بك",
        createAccountButton: "إنشاء حساب",
        createSupervisorAccountButton: "إنشاء حساب مشرف",
        orContinueWith: "أو تابع مع",
        registerWithGoogle: "التسجيل باستخدام جوجل",
        haveAccount: "هل لديك حساب بالفعل؟",
        login: "تسجيل الدخول",
    },
    landing: {
        title: "انطلق في اللغة مع الذكاء الاصطناعي",
        description: "يجمع LinguaLeap بين تقنيات التعلم المثبتة والذكاء الاصطناعي المتطور لإنشاء تجربة بناء مفردات مخصصة وفعالة.",
        getStarted: "ابدأ التعلم الآن",
        login: "تسجيل الدخول",
        features: {
            title: "لماذا يعمل LinguaLeap",
            description: "لقد صممنا המزيج المثالي من التكنولوجيا والتربية لتسريع اكتسابك للغة.",
            aiQuizzes: {
                title: "اختبارات مدعومة بالذكاء الاصطناعي",
                description: "تحدَّ نفسك بخيارات غير صحيحة تم إنشاؤها بواسطة الذكاء الاصطناعي، مما يجعل التعلم أكثر فعالية وجاذبية."
            },
            supervisorTools: {
                title: "أدوات المشرف",
                description: "يمكن للمشرفين إضافة مفردات مخصصة وتتبع تقدم الطلاب، وتخصيص تجربة التعلم."
            },
            srs: {
                title: "التكرار المتباعد",
                description: "تقوم الخوارزمية الذكية لدينا بجدولة المراجعات على فترات مثالية لتثبيت الكلمات في ذاكرتك طويلة المدى."
            }
        },
        footer: {
            copyright: "© 2024 LinguaLeap. كل الحقوق محفوظة.",
            terms: "شروط الخدمة",
            privacy: "الخصوصية",
        }
    },
    learn: {
        title: "جلسة تعلم",
        question: "أي كلمة تعني: “{0}”؟",
        nextWord: "الكلمة التالية",
        iKnowIt: "اعتبار الإجابة صحيحة",
        backToDashboard: "العودة إلى لوحة التحكم",
        finishedTitle: "لقد انتهيت من كل شيء في الوقت الحالي!",
        finishedDescription1: "لقد راجعت كل كلماتك المستحقة. عمل رائع!",
        finishedDescription2: "عد لاحقًا لجلستك التالية.",
        startNewSession: "ابدأ جلسة جديدة على أي حال",
        wordStrength: "قوة الكلمة",
    },
    dashboard: {
        student: {
            welcome: "مرحبًا، {0}!",
            description: "إليك ملخص لتقدمك في التعلم. استمر في العمل الرائع!",
            reviewTitle: "كلمات للمراجعة",
            reviewDescription: "جاهز لجلستك التالية",
            learnedTitle: "الكلمات قيد التعلم",
            learnedDescription: "تتعلم بنشاط عبر SRS",
            masteredTitle: "الكلمات المتقنة",
            masteredDescription: "الكلمات التي تم نقلها إلى الذاكرة طويلة المدى",
        },
        supervisor: {
            title: "لوحة تحكم المشرف",
            welcome: "مرحبًا، {0}.",
            supervisorId: {
                title: "معرف المشرف الخاص بك",
                description: "شارك هذا المعرف مع طلابك حتى يتمكنوا من الاتصال بك."
            },
            myStudents: {
                title: "طلابي",
                description: "قائمة الطلاب تحت إشرافك.",
                name: "الاسم",
                email: "البريد الإلكتروني"
            }
        },
        loading: "جار التحميل..."
    },
    addWord: {
        title: "إضافة كلمة جديدة",
        description: "أنشئ بطاقة مفردات جديدة لطلابك. سيقوم الذكاء الاصطناعي بإنشاء خيارات مضللة تلقائيًا.",
        cardTitle: "بطاقة مفردات جديدة",
        cardDescription: "املأ تفاصيل الكلمة الجديدة.",
        form: {
            wordLabel: "الكلمة",
            wordPlaceholder: "مثال: سريع الزوال",
            definitionLabel: "التعريف",
            definitionPlaceholder: "مثال: يدوم لفترة قصيرة جدًا.",
            unitLabel: "الوحدة",
            selectUnit: "اختر وحدة",
            imageLabel: "صورة توضيحية",
            addButton: "إضافة كلمة",
            addingButton: "جار إضافة الكلمة...",
        }
    },
    editWord: {
        title: "تعديل الكلمة",
        description: "قم بتحديث تفاصيل بطاقة المفردات الخاصة بك.",
        cardTitle: "تعديل: {0}",
        cardDescription: "قم بتعديل الحقول أدناه واحفظ تغييراتك.",
        form: {
            currentImage: "الصورة الحالية:",
            imageHelper: "اتركه فارغًا للاحتفاظ بالصورة الحالية.",
            saveButton: "حفظ التغييرات",
            savingButton: "جارٍ حفظ التغييرات...",
        }
    },
    wordsPage: {
        title: "كلماتي المتعلمة",
        myLearnedWordsDesc: "راجع وأدر الكلمات التي تتعلمها بنشاط.",
        description: "تصفح وأدر بطاقات المفردات الخاصة بك.",
        addNew: "إضافة كلمة جديدة",
        table: {
            title: "مجموعتي من الكلمات",
            description: "قائمة كاملة بجميع الكلمات التي أضفتها.",
            image: "صورة",
            word: "الكلمة",
            definition: "التعريف",
            unit: "الوحدة",
            actions: "الإجراءات",
            nextReview: "المراجعة التالية",
            reviewOverdue: "متأخر",
            reviewToday: "اليوم",
            reviewTomorrow: "غداً",
            reviewInDays: "خلال {0} أيام",
        },
        deleteDialog: {
            title: "هل أنت متأكد تمامًا؟",
            description: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الكلمة بشكل دائم “{0}” من قائمتك.",
            cancel: "إلغاء",
            continue: "متابعة",
        },
        resetDialog: {
            title: "هل أنت متأكد من رغبتك في إعادة ضبط هذه الكلمة؟",
            description: "سيؤدي هذا إلى إعادة ضبط تقدم تعلم “{0}” وإعادته إلى قائمة المراجعة الخاصة بك.",
            continue: "إعادة تعيين",
        },
        wontForgetButton: "لن أنسى",
        wontForgetDialog: {
            title: "الانتقال إلى الكلمات المتقنة؟",
            description: "سيؤدي هذا إلى إزالة “{0}” من جدول المراجعة المنتظم. يمكنك استعادته لاحقًا من صفحة الكلمات المتقنة.",
            continue: "تأكيد",
        }
    },
    masteredWordsPage: {
        title: "الكلمات المتقنة",
        description: "الكلمات التي تعلمتها بالكامل. لم تعد مدرجة في جدول المراجعة الخاص بك.",
        badge: "متقن",
        restoreDialog: {
            title: "استعادة للتعلم؟",
            description: "سيؤدي هذا إلى إضافة “{0}” مرة أخرى إلى قائمة انتظار التعلم الخاصة بك للمراجعة.",
            continue: "استعادة"
        }
    },
    unitsPage: {
        title: "وحداتي",
        description: "إدارة وحدات المفردات الخاصة بك.",
        allUnits: {
            title: "جميع الوحدات",
            description: "قائمة بجميع وحدات المفردات الخاصة بك.",
            name: "اسم الوحدة",
            actions: "الإجراءات",
        },
        addUnit: {
            title: "إضافة وحدة جديدة",
            description: "أنشئ وحدة جديدة لتصنيف كلماتك.",
            form: {
                nameLabel: "اسم الوحدة",
                namePlaceholder: "مثال: الفصل الأول الأفعال",
                addButton: "إضافة وحدة",
                addingButton: "جارٍ إضافة الوحدة...",
            }
        },
        deleteDialog: {
            description: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الوحدة بشكل دائم “{0}”. سوف تحتاج إلى إعادة تعيين أي كلمات في هذه الوحدة.",
        }
    },
    studentsPage: {
        title: "طلابي",
        description: "مرحبًا، {0}. إليك طلابك.",
        allStudents: {
            title: "All Students",
            description: "A list of students under your supervision.",
        },
    },
    toasts: {
        error: "خطأ",
        success: "نجاح!",
        addUnitSuccess: "تم إنشاء الوحدة!",
        addUnitExists: "الوحدة موجودة بالفعل.",
        addWordSuccess: "تم إنشاء الكلمة!",
        updateWordSuccess: "تم تحديث الكلمة بنجاح!",
        deleteWordSuccess: "تم حذف الكلمة بنجاح.",
        resetWordSuccess: "تمت إعادة ضبط تقدم “{0}”.",
        restoreWordSuccess: "تمت استعادة “{0}” إلى قائمة التعلم الخاصة بك.",
        rescheduleSuccess: "تمت إعادة جدولة “{0}”.",
        wontForgetText: "تم نقل “{0}” إلى الكلمات المتقنة.",
        validationFailed: "فشل التحقق.",
        aiError: "فشل إضافة الكلمة. خطأ في إنشاء الذكاء الاصطناعي: {0}",
        registerSuccess: "نجاح!",
        loginError: "بريد إلكتروني أو كلمة مرور غير صالحة.",
        supervisorIdRequired: "معرف المشرف مطلوب للطلاب.",
        invalidSupervisorId: "معرف المشرف غير صالح.",
        userExists: "مستخدم بهذا البريد الإلكتروني موجود بالفعل.",
        passwordLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
        nameRequired: "الاسم مطلوب.",
        invalidEmail: "عنوان البريد الإلكتروني غير صالح.",
        unitRequired: "يرجى تحديد وحدة.",
        definitionRequired: "التعريف مطلوب.",
        wordRequired: "الكلمة مطلوبة.",
        imageRequired: "الصورة مطلوبة."
    }
  }
};

export type TranslationKey = 
    | 'sidebar.dashboard' | 'sidebar.learn' | 'sidebar.myWords' | 'sidebar.masteredWords' | 'sidebar.addWord' | 'sidebar.myUnits' | 'sidebar.myStudents' | 'sidebar.profile'
    | 'profile.title' | 'profile.personalInfo.title' | 'profile.personalInfo.description' | 'profile.personalInfo.picture' | 'profile.personalInfo.fullName' | 'profile.personalInfo.email' | 'profile.personalInfo.save'
    | 'profile.preferences.title' | 'profile.preferences.description' | 'profile.preferences.language' | 'profile.preferences.selectLanguage' | 'profile.preferences.timezone' | 'profile.preferences.selectTimezone' | 'profile.preferences.fontSize' | 'profile.preferences.selectFontSize' | 'profile.preferences.fontSmall' | 'profile.preferences.fontDefault' | 'profile.preferences.fontLarge' | 'profile.preferences.save'
    | 'profile.account.title' | 'profile.account.description' | 'profile.account.resetPassword.title' | 'profile.account.resetPassword.description' | 'profile.account.resetPassword.button' | 'profile.account.deleteAccount.title' | 'profile.account.deleteAccount.description' | 'profile.account.deleteAccount.button'
    | 'login.welcome' | 'login.description' | 'login.emailLabel' | 'login.passwordLabel' | 'login.forgotPassword' | 'login.loginButton' | 'login.loginWithGoogle' | 'login.noAccount' | 'login.signUp'
    | 'register.title' | 'register.description' | 'register.studentTab' | 'register.supervisorTab' | 'register.fullNameLabel' | 'register.fullNamePlaceholder' | 'register.emailLabel' | 'register.emailPlaceholder' | 'register.passwordLabel' | 'register.supervisorIdLabel' | 'register.supervisorIdPlaceholder' | 'register.createAccountButton' | 'register.createSupervisorAccountButton' | 'register.orContinueWith' | 'register.registerWithGoogle' | 'register.haveAccount' | 'register.login'
    | 'landing.title' | 'landing.description' | 'landing.getStarted' | 'landing.login'
    | 'landing.features.title' | 'landing.features.description'
    | 'landing.features.aiQuizzes.title' | 'landing.features.aiQuizzes.description'
    | 'landing.features.supervisorTools.title' | 'landing.features.supervisorTools.description'
    | 'landing.features.srs.title' | 'landing.features.srs.description'
    | 'landing.footer.copyright' | 'landing.footer.terms' | 'landing.footer.privacy'
    | 'learn.title' | 'learn.question' | 'learn.nextWord' | 'learn.iKnowIt' | 'learn.backToDashboard' | 'learn.finishedTitle' | 'learn.finishedDescription1' | 'learn.finishedDescription2' | 'learn.startNewSession' | 'learn.wordStrength'
    | 'dashboard.student.welcome' | 'dashboard.student.description' | 'dashboard.student.reviewTitle' | 'dashboard.student.reviewDescription' | 'dashboard.student.learnedTitle' | 'dashboard.student.learnedDescription' | 'dashboard.student.masteredTitle' | 'dashboard.student.masteredDescription'
    | 'dashboard.supervisor.title' | 'dashboard.supervisor.welcome' | 'dashboard.supervisor.supervisorId.title' | 'dashboard.supervisor.supervisorId.description' | 'dashboard.supervisor.myStudents.title' | 'dashboard.supervisor.myStudents.description' | 'dashboard.supervisor.myStudents.name' | 'dashboard.supervisor.myStudents.email'
    | 'dashboard.loading'
    | 'addWord.title' | 'addWord.description' | 'addWord.cardTitle' | 'addWord.cardDescription'
    | 'addWord.form.wordLabel' | 'addWord.form.wordPlaceholder' | 'addWord.form.definitionLabel' | 'addWord.form.definitionPlaceholder' | 'addWord.form.unitLabel' | 'addWord.form.selectUnit' | 'addWord.form.imageLabel' | 'addWord.form.addButton' | 'addWord.form.addingButton'
    | 'editWord.title' | 'editWord.description' | 'editWord.cardTitle' | 'editWord.cardDescription' | 'editWord.form.currentImage' | 'editWord.form.imageHelper' | 'editWord.form.saveButton' | 'editWord.form.savingButton'
    | 'wordsPage.title' | 'wordsPage.myLearnedWordsDesc' | 'wordsPage.description' | 'wordsPage.addNew'
    | 'wordsPage.table.title' | 'wordsPage.table.description' | 'wordsPage.table.image' | 'wordsPage.table.word' | 'wordsPage.table.definition' | 'wordsPage.table.unit' | 'wordsPage.table.actions' | 'wordsPage.table.nextReview' | 'wordsPage.table.reviewOverdue' | 'wordsPage.table.reviewToday' | 'wordsPage.table.reviewTomorrow' | 'wordsPage.table.reviewInDays'
    | 'wordsPage.deleteDialog.title' | 'wordsPage.deleteDialog.description' | 'wordsPage.deleteDialog.cancel' | 'wordsPage.deleteDialog.continue'
    | 'wordsPage.resetDialog.title' | 'wordsPage.resetDialog.description' | 'wordsPage.resetDialog.continue'
    | 'wordsPage.wontForgetButton' | 'wordsPage.wontForgetDialog.title' | 'wordsPage.wontForgetDialog.description' | 'wordsPage.wontForgetDialog.continue'
    | 'masteredWordsPage.title' | 'masteredWordsPage.description' | 'masteredWordsPage.badge' | 'masteredWordsPage.restoreDialog.title' | 'masteredWordsPage.restoreDialog.description' | 'masteredWordsPage.restoreDialog.continue'
    | 'unitsPage.title' | 'unitsPage.description'
    | 'unitsPage.allUnits.title' | 'unitsPage.allUnits.description' | 'unitsPage.allUnits.name' | 'unitsPage.allUnits.actions'
    | 'unitsPage.addUnit.title' | 'unitsPage.addUnit.description'
    | 'unitsPage.addUnit.form.nameLabel' | 'unitsPage.addUnit.form.namePlaceholder' | 'unitsPage.addUnit.form.addButton' | 'unitsPage.addUnit.form.addingButton'
    | 'unitsPage.deleteDialog.description'
    | 'studentsPage.title' | 'studentsPage.description'
    | 'studentsPage.allStudents.title' | 'studentsPage.allStudents.description'
    | 'toasts.error' | 'toasts.success' | 'toasts.addUnitSuccess' | 'toasts.addUnitExists' | 'toasts.addWordSuccess' | 'toasts.updateWordSuccess' | 'toasts.deleteWordSuccess' | 'toasts.resetWordSuccess' | 'toasts.restoreWordSuccess' | 'toasts.rescheduleSuccess' | 'toasts.wontForgetText' | 'toasts.validationFailed' | 'toasts.aiError' | 'toasts.registerSuccess' | 'toasts.loginError' | 'toasts.supervisorIdRequired' | 'toasts.invalidSupervisorId' | 'toasts.userExists' | 'toasts.passwordLength' | 'toasts.nameRequired' | 'toasts.invalidEmail' | 'toasts.unitRequired' | 'toasts.definitionRequired' | 'toasts.wordRequired' | 'toasts.imageRequired';
