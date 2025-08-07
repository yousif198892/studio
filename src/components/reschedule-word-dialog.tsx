
"use client";

import { useState } from "react";
import { Word } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar, Star } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { ScheduleOption } from "@/app/learn/page";
import { updateStudentProgressInStorage } from "@/lib/storage";

interface RescheduleWordDialogProps {
  word: Word;
  userId: string;
  onWordRescheduled: () => void;
}

export function RescheduleWordDialog({ word, userId, onWordRescheduled }: RescheduleWordDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleScheduleSelect = (option: ScheduleOption) => {
    let newStrength = word.strength;
    const nextReview = new Date();

    switch (option) {
      case 'tomorrow':
        nextReview.setDate(nextReview.getDate() + 1);
        break;
      case 'twoDays':
        nextReview.setDate(nextReview.getDate() + 2);
        break;
      case 'week':
        newStrength = Math.max(0, word.strength) + 1;
        const intervals = [1, 2, 4, 8, 16, 32, 64];
        const newInterval = intervals[Math.min(newStrength, intervals.length - 1)];
        nextReview.setDate(nextReview.getDate() + newInterval);
        break;
      case 'twoWeeks':
        nextReview.setDate(nextReview.getDate() + 14);
        break;
      case 'month':
        nextReview.setMonth(nextReview.getMonth() + 1);
        break;
      case 'mastered':
        newStrength = -1; // Mark as mastered
        break;
    }

    updateStudentProgressInStorage(userId, { id: word.id, strength: newStrength, nextReview });
    
    toast({
        title: t('toasts.success'),
        description: option === 'mastered' ? t('toasts.wontForgetText', word.word) : t('toasts.rescheduleSuccess', word.word)
    });
    
    onWordRescheduled(); // Notify parent to refresh list
    setIsOpen(false); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Calendar className="h-4 w-4" />
          <span className="sr-only">Reschedule Word</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quizCard.schedule.title')}</DialogTitle>
          <DialogDescription>
            {t('quizCard.schedule.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-2 pt-4">
          <Button onClick={() => handleScheduleSelect('tomorrow')} variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.tomorrow')}
          </Button>
          <Button onClick={() => handleScheduleSelect('twoDays')} variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.inTwoDays')}
          </Button>
          <Button onClick={() => handleScheduleSelect('week')} variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.inAWeek')}
          </Button>
           <Button onClick={() => handleScheduleSelect('twoWeeks')} variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.inTwoWeeks')}
          </Button>
          <Button onClick={() => handleScheduleSelect('month')} variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.inAMonth')}
          </Button>
          <Button onClick={() => handleScheduleSelect('mastered')} variant="secondary" className="w-full justify-start">
            <Star className="mr-2 h-4 w-4" />
            {t('quizCard.schedule.mastered')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
