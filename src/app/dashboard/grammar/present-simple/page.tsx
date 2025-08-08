
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TestTube2 } from 'lucide-react';
import Link from 'next/link';

const TENSE_NAME = "Present Simple";
const STORAGE_KEY = `grammar_explanation_${TENSE_NAME.replace(/\s/g, '_')}`;

export default function PresentSimplePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [explanation, setExplanation] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const savedExplanation = localStorage.getItem(STORAGE_KEY);
        if (savedExplanation) {
            setExplanation(savedExplanation);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, explanation);
        toast({
            title: "Success!",
            description: "Explanation for Present Simple has been saved."
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{TENSE_NAME} Tense</h1>
            <p className="text-muted-foreground">
                Provide an explanation for your students and create a test.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Explanation</CardTitle>
                            <CardDescription>
                                Write a clear explanation of the {TENSE_NAME} tense. This will be shown to students.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="explanation" className="sr-only">Explanation</Label>
                                <Textarea
                                    id="explanation"
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder={`e.g., Use the Present Simple for habits, routines, and general truths...`}
                                    rows={15}
                                />
                            </div>
                            <Button onClick={handleSave}>Save Explanation</Button>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Test</CardTitle>
                            <CardDescription>
                                After reading your explanation, students can test their knowledge. The quiz is generated dynamically by AI.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href={`/dashboard/grammar/present-simple/quiz?userId=${userId}`}>
                                    <TestTube2 className="mr-2 h-4 w-4" />
                                    Preview Test
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
