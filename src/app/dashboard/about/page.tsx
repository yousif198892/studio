
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import Image from "next/image";
import appInfo from "../../../../package.json";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { getAsset } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutPage() {
    const { t } = useLanguage();
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSignature = async () => {
            const image = await getAsset('signatureImage');
            if (image) {
                setSignatureImage(image);
            }
            setLoading(false);
        }
        fetchSignature();
    }, []);

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
                        {loading ? (
                            <Skeleton className="h-[50px] w-[200px] mt-2" />
                        ) : signatureImage ? (
                             <Image 
                                src={signatureImage}
                                alt="Yousif's signature"
                                width={200}
                                height={50}
                                className="mt-2 invert-0 dark:invert"
                             />
                        ) : (
                            <p className="text-sm text-muted-foreground">Signature not found.</p>
                        )}
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
