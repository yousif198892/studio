
"use client";

import { Star, Calendar, BookOpen, BrainCircuit, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

type XpEvent = 
  | 'review_word'
  | 'spell_correct'
  | 'daily_login'
  | 'master_word'
  | 'grammar_test';

const eventIcons: Record<XpEvent, React.ReactNode> = {
    review_word: <BookOpen className="h-5 w-5 text-green-500" />,
    spell_correct: <BrainCircuit className="h-5 w-5 text-green-500" />,
    daily_login: <Calendar className="h-5 w-5 text-green-500" />,
    master_word: <Trophy className="h-5 w-5 text-yellow-500" />,
    grammar_test: <Trophy className="h-5 w-5 text-yellow-500" />
};

interface XpToastProps {
    event: XpEvent;
    amount: number;
}

export function XpToast({ event, amount }: XpToastProps) {
    const { t } = useLanguage();
    const message = t(`xpEvents.${event}`);
    const icon = eventIcons[event];
    
    return (
        <div className="flex items-center gap-4">
            {icon}
            <div className="flex flex-col">
                <span className="font-semibold">{message}</span>
                <span className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                    +{amount} XP
                    <Star className="h-4 w-4 fill-current" />
                </span>
            </div>
        </div>
    );
}

    