
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

const TENSE_NAME = "Present Simple";

export default function PresentSimplePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const { toast } = useToast();
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{TENSE_NAME} Tense</h1>
            <p className="text-muted-foreground">
                Preview the test for your students.
            </p>
            <div className="flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{t('grammar.studentTest.title')}</CardTitle>
                        <CardDescription>
                            {t('grammar.studentTest.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/grammar/present-simple/quiz?userId=${userId}`}>
                                <TestTube2 className="mr-2 h-4 w-4" />
                                {t('grammar.studentTest.button')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
