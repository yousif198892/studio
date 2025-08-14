
"use client";

import { Star, Calendar, BookOpen, BrainCircuit, Trophy } from "lucide-react";

type XpEvent = 
  | 'review_word'
  | 'spell_correct'
  | 'daily_login'
  | 'master_word'
  | 'grammar_test';

const eventDetails: Record<XpEvent, { message: string, icon: React.ReactNode }> = {
    review_word: { message: "Word Reviewed", icon: <BookOpen className="h-5 w-5 text-green-500" /> },
    spell_correct: { message: "Spelling Correct", icon: <BrainCircuit className="h-5 w-5 text-green-500" /> },
    daily_login: { message: "Daily Login", icon: <Calendar className="h-5 w-5 text-green-500" /> },
    master_word: { message: "Word Mastered", icon: <Trophy className="h-5 w-5 text-yellow-500" /> },
    grammar_test: { message: "Grammar Test", icon: <Trophy className="h-5 w-5 text-yellow-500" /> }
};

interface XpToastProps {
    event: XpEvent;
    amount: number;
}

export function XpToast({ event, amount }: XpToastProps) {
    const details = eventDetails[event];
    
    return (
        <div className="flex items-center gap-4">
            {details.icon}
            <div className="flex flex-col">
                <span className="font-semibold">{details.message}</span>
                <span className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                    +{amount} XP
                    <Star className="h-4 w-4 fill-current" />
                </span>
            </div>
        </div>
    );
}
