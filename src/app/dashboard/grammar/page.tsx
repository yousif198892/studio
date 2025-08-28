
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Globe } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";

export default function GrammarPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const { t } = useLanguage();

    const tenses = [
        { name: t('grammar.tenses.presentSimple'), href: `/dashboard/grammar/present-simple?userId=${userId}` },
        { name: t('grammar.tenses.pastSimple'), href: `/dashboard/grammar/past-simple?userId=${userId}` },
        { name: t('grammar.tenses.presentContinuous'), href: `/dashboard/grammar/present-continuous?userId=${userId}` }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{t('grammar.hub.title')}</h1>
            <p className="text-muted-foreground">
                {t('grammar.hub.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('grammar.hub.individualTenses.title')}</CardTitle>
                        <CardDescription>{t('grammar.hub.individualTenses.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tenses.map((tense) => (
                                <Link href={tense.href} key={tense.name}>
                                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <span className="font-medium">{tense.name}</span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('grammar.hub.comprehensiveTest.title')}</CardTitle>
                        <CardDescription>{t('grammar.hub.comprehensiveTest.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/dashboard/grammar/comprehensive-quiz?userId=${userId}`}>
                            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                <span className="font-medium">{t('grammar.hub.comprehensiveTest.button')}</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Specific Skills</CardTitle>
                        <CardDescription>Practice specific grammar points like prepositions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/dashboard/grammar/prepositions-of-place/quiz?userId=${userId}`}>
                             <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-primary"/>
                                    <span className="font-medium">Prepositions of Place (in, on, at)</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
