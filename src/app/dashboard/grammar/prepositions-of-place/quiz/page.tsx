
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePrepositionsQuiz } from '@/ai/flows/generate-prepositions-quiz';
import type { PrepositionsQuizQuestion } from '@/ai/schemas/prepositions-quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updateLearningStats } from '@/lib/stats.tsx';
import { useToast } from '@/hooks/use-toast';

const TEST_NAME = "Prepositions of Place";

export default function PrepositionsQuizPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [quiz, setQuiz] = useState<PrepositionsQuizQuestion[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const { toast } = useToast();

    const handleUpdateStats = useCallback(async (durationSeconds: number, testName?: string) => {
        if (userId) {
            await updateLearningStats({ userId, durationSeconds, testName, toast });
        }
    }, [userId, toast]);

    useEffect(() => {
        startTimeRef.current = Date.now();
        const cleanup = () => {
            if (startTimeRef.current) {
                const endTime = Date.now();
                const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);
                if (durationSeconds > 0) {
                    handleUpdateStats(durationSeconds);
                }
                startTimeRef.current = null;
            }
        };

        window.addEventListener('beforeunload', cleanup);
        return () => {
            cleanup();
            window.removeEventListener('beforeunload', cleanup);
        };
    }, [handleUpdateStats]);

    const fetchQuiz = async () => {
        setLoading(true);
        setError(null);
        setSubmitted(false);
        setAnswers({});
        try {
            const result = await generatePrepositionsQuiz({});
            if (result && result.questions) {
                setQuiz(result.questions);
            } else {
                throw new Error("AI failed to generate quiz questions.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, []);

    const handleAnswerChange = (questionIndex: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: value }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
        handleUpdateStats(0, TEST_NAME);
    };

    const getScore = () => {
        if (!quiz) return 0;
        return quiz.reduce((score, question, index) => {
            return score + (answers[index] === question.correctOption ? 1 : 0);
        }, 0);
    };
    
    const getOptionState = (questionIndex: number, option: string) => {
        if (!submitted) return "default";
        const question = quiz![questionIndex];
        const isCorrect = option === question.correctOption;
        const isSelected = answers[questionIndex] === option;

        if (isCorrect) return "correct";
        if (isSelected && !isCorrect) return "incorrect";
        return "default";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating your quiz on prepositions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{TEST_NAME} Test</h1>
            <p className="text-muted-foreground">
                Test your knowledge of using "in", "on", and "at" for places.
            </p>

            <div className="space-y-8">
                {quiz?.map((q, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>Question {index + 1}</CardTitle>
                            <CardDescription>{q.questionText}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[index] || ""}
                                onValueChange={(value) => handleAnswerChange(index, value)}
                                disabled={submitted}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {q.options.map((option, optionIndex) => {
                                        const state = getOptionState(index, option);
                                        return (
                                            <Label
                                                key={optionIndex}
                                                className={cn(
                                                    "flex items-center justify-center space-x-3 rounded-lg border p-4 transition-all",
                                                     !submitted && "cursor-pointer",
                                                    state === "correct" && "border-green-500 bg-green-500/10 text-green-900 font-semibold",
                                                    state === "incorrect" && "border-destructive bg-destructive/10 text-destructive font-semibold"
                                                )}
                                            >
                                                <RadioGroupItem value={option} id={`${index}-${optionIndex}`} />
                                                <span>{option}</span>
                                            </Label>
                                        );
                                    })}
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
                {!submitted ? (
                     <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz?.length}>
                        Submit Answers
                    </Button>
                ) : (
                    <Card className="p-6 text-center">
                        <CardTitle>Test Complete!</CardTitle>
                        <CardDescription className="mt-2">You scored {getScore()} out of {quiz?.length}.</CardDescription>
                        <Button onClick={fetchQuiz} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Take a New Test
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
