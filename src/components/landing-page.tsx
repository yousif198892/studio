
"use client";

import Link from "next/link";
import { BrainCircuit, Users, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/hooks/use-language";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const [heroImage, setHeroImage] = useState("https://placehold.co/500x625.png?text=LinguaLeap");

  useEffect(() => {
    // Try to get the image from sessionStorage first
    const sessionImage = sessionStorage.getItem('landingHeroImage');
    if (sessionImage) {
      setHeroImage(sessionImage);
    }
  }, []);

  const handleLanguageChange = (checked: boolean) => {
    setLanguage(checked ? 'ar' : 'en');
  };

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: t('landing.features.aiQuizzes.title'),
      description: t('landing.features.aiQuizzes.description'),
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: t('landing.features.supervisorTools.title'),
      description: t('landing.features.supervisorTools.description'),
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: t('landing.features.srs.title'),
      description: t('landing.features.srs.description'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo />
          <span className="sr-only">LinguaLeap</span>
        </Link>
        <nav className="ms-auto flex items-center gap-4 sm:gap-6">
           <div className="flex items-center space-x-2">
            <Label htmlFor="language-switch" className={language === 'en' ? 'text-primary font-bold' : 'text-muted-foreground'}>EN</Label>
            <Switch
              id="language-switch"
              checked={language === 'ar'}
              onCheckedChange={handleLanguageChange}
              aria-label="Toggle language between English and Arabic"
            />
            <Label htmlFor="language-switch" className={language === 'ar' ? 'text-primary font-bold' : 'text-muted-foreground'}>AR</Label>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            {t('landing.login')}
          </Link>
          <Button asChild>
            <Link href="/register" prefetch={false}>
              {t('landing.getStarted')}
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
                  {t('landing.title')}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  {t('landing.description')}
                </p>
                <div className="space-x-4 mt-6">
                  <Button asChild size="lg">
                    <Link href="/register" prefetch={false}>
                      {t('landing.getStarted')} <ArrowRight className="ms-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                 <Image
                    src={heroImage}
                    alt="An illustration of a smartphone with a language learning interface, an English book, and a globe."
                    width={500}
                    height={625}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="language learning app"
                    key={heroImage}
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
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  {t('landing.features.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('landing.features.description')}
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
        <p className="text-xs text-muted-foreground">{t('landing.footer.copyright')}</p>
        <nav className="sm:ms-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            {t('landing.footer.terms')}
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            {t('landing.footer.privacy')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
