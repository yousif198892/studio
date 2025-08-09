"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import appInfo from "../../../../package.json";
import { Logo } from "@/components/logo";

export default function AboutPage() {
    const { t } = useLanguage();

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
                        <p className="font-headline text-xl">Yousif</p>
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
