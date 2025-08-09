
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import Image from "next/image";
import appInfo from "../../../../package.json";
import { Logo } from "@/components/logo";

export default function AboutPage() {
    const { t } = useLanguage();
    const signatureImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQcAAABACAYAAADe9TsfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAv5SURBVHhe7Z1tcttoGIZtTybv9zM/yWfyT/JgOwoiEAEiBAFpW7WqW9X3zGz2h2lq6hF/0m+yJ//85S9/+Z//+Z8Z+r//+79h/M//+Z/D+Pd///cM/z//8z8z/L/++usM/13x8PDw8PDw8PCkHqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG-AASUVORK5CYII=";

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{t('about.title')}</h1>
            <p className="text-muted-foreground">
                {t('about.description')}
            </p>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                        <Logo className="w-10 h-10 text-primary" />
                        <span>LinguaLeap</span>
                    </CardTitle>
                    <CardDescription>
                        {t('about.greeting')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-base leading-relaxed">
                    <p>
                       {t('about.teacherIntro')}
                    </p>
                    <p>
                       {t('about.aiIntro')}
                    </p>
                    <div className="pt-4 border-t">
                        <p className="text-muted-foreground">{t('about.signature')}</p>
                         <Image 
                            src={signatureImage}
                            alt="Yousif's signature"
                            width={200}
                            height={50}
                            className="mt-2 invert-0 dark:invert"
                         />
                    </div>
                </CardContent>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        {t('about.version', appInfo.version)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
