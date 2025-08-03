"use client";

import Link from "next/link";
import { BrainCircuit, Users, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function LandingPage() {
  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "اختبارات مدعومة بالذكاء الاصطناعي",
      description:
        "تحدَّ نفسك بخيارات غير صحيحة تم إنشاؤها بواسطة الذكاء الاصطناعي، مما يجعل التعلم أكثر فعالية وجاذبية.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "أدوات المشرف",
      description:
        "يمكن للمشرفين إضافة مفردات مخصصة وتتبع تقدم الطلاب، وتخصيص تجربة التعلم.",
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: "التكرار المتباعد",
      description:
        "تقوم الخوارزمية الذكية لدينا بجدولة المراجعات على فترات مثالية لتثبيت الكلمات في ذاكرتك طويلة المدى.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo />
          <span className="sr-only">LinguaLeap</span>
        </Link>
        <nav className="mr-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            تسجيل الدخول
          </Link>
          <Button asChild>
            <Link href="/register" prefetch={false}>
              ابدأ
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full pt-24 md:pt-32 lg:pt-40 bg-secondary">
          <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-headline text-primary">
                  انطلق في اللغة مع الذكاء الاصطناعي
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  يجمع LinguaLeap بين تقنيات التعلم المثبتة والذكاء الاصطناعي المتطور لإنشاء تجربة بناء مفردات مخصصة وفعالة.
                </p>
                <div className="space-x-4 mt-6">
                  <Button asChild size="lg">
                    <Link href="/register" prefetch={false}>
                      ابدأ التعلم الآن <ArrowRight className="mr-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Hero"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="language learning abstract"
                  />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">
                  الميزات الرئيسية
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  لماذا يعمل LinguaLeap
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  لقد صممنا المزيج المثالي من التكنولوجيا والتربية لتسريع اكتسابك للغة.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-secondary/50">
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 font-headline">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-secondary">
        <p className="text-xs text-muted-foreground">&copy; 2024 LinguaLeap. كل الحقوق محفوظة.</p>
        <nav className="sm:mr-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            شروط الخدمة
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            الخصوصية
          </Link>
        </nav>
      </footer>
    </div>
  );
}
