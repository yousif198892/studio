
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trophy, Star } from "lucide-react";
import { type LastWeekWinner } from "@/lib/stats.tsx";
import { cn } from "@/lib/utils";

interface WinnersCircleProps {
  isOpen: boolean;
  onClose: () => void;
  winners: LastWeekWinner[];
  currentUserId: string;
}

const Confetti = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
        {[...Array(150)].map((_, i) => (
            <div
                key={i}
                className="confetti-piece"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                }}
            />
        ))}
    </div>
);

export function WinnersCircle({ isOpen, onClose, winners, currentUserId }: WinnersCircleProps) {
    const currentUserResult = winners.find(w => w.id === currentUserId);
    const getCongratulatoryMessage = () => {
        if (!currentUserResult) {
            return "Great effort last week! Keep it up!";
        }
        switch(currentUserResult.rank) {
            case 1: return "Incredible! You're the champion of the week!";
            case 2: return "Amazing work! You secured 2nd place!";
            case 3: return "Fantastic! You made it to the top 3!";
            default: return "Great effort last week! Keep it up!";
        }
    }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <style jsx global>{`
            .confetti-piece {
                position: absolute;
                width: 8px;
                height: 16px;
                border-radius: 4px;
                opacity: 0.7;
                animation: fall 5s linear infinite;
            }

            @keyframes fall {
                0% {
                    transform: translateY(-10vh) rotateZ(0deg);
                }
                100% {
                    transform: translateY(110vh) rotateZ(720deg);
                }
            }
        `}</style>
      <DialogContent className="max-w-md">
        <Confetti />
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">Last Week's Champions!</DialogTitle>
          <DialogDescription className="text-center">
            {getCongratulatoryMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
            {winners.map((winner, index) => (
                 <div
                    key={winner.id}
                    className={cn(
                        "p-3 border rounded-lg flex items-center gap-4 transition-all w-full",
                        winner.rank === 1 && "bg-yellow-100/50 border-yellow-500 scale-105 shadow-lg",
                        winner.rank === 2 && "bg-gray-100/50 border-gray-400",
                        winner.rank === 3 && "bg-orange-100/50 border-orange-400",
                        winner.id === currentUserId && "ring-2 ring-primary"
                    )}
                    >
                    <div className="flex items-center justify-center w-10 text-xl font-bold">
                       <Trophy className={cn(
                           "w-8 h-8",
                           winner.rank === 1 && "text-yellow-500 fill-yellow-400",
                           winner.rank === 2 && "text-gray-400 fill-gray-300",
                           winner.rank === 3 && "text-orange-600 fill-orange-400"
                       )} />
                    </div>
                    <Image 
                        src={winner.avatar}
                        alt={winner.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="flex-1">
                        <p className="font-semibold">{winner.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                        <span>{winner.xp.toLocaleString()}</span>
                        <Star className="h-4 w-4 fill-current"/>
                    </div>
                 </div>
            ))}
        </div>
        <DialogFooter className="mt-6">
            <Button onClick={onClose} className="w-full">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
