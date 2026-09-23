"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Flashcard {
  concept: string;
  question: string;
  answer: string;
}

interface FlashcardModalProps {
  isOpen: boolean;
  topic: string;
  subjectName?: string;
  flashcards: Flashcard[];
  onClose: () => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  topic,
  subjectName,
  flashcards,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  if (!isOpen || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredCards.includes(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleMastered = () => {
    if (isMastered) {
      setMasteredCards(masteredCards.filter((i) => i !== currentIndex));
    } else {
      setMasteredCards([...masteredCards, currentIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8 space-y-6 bg-surface-card border-forge/50 shadow-glow-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forge" />
              <h2 className="text-lg font-black text-txt-primary">
                Session Active Recall Flashcards
              </h2>
            </div>
            <p className="text-xs text-txt-secondary">
              Generated from your session on <span className="text-forge font-semibold">{topic}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-txt-muted hover:text-txt-primary text-xs p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Concept Header */}
        <div className="flex items-center justify-between text-xs font-mono text-txt-muted">
          <Badge variant="forge" size="sm">
            {currentCard.concept}
          </Badge>
          <span>
            CARD {currentIndex + 1} OF {flashcards.length} ({masteredCards.length} Mastered)
          </span>
        </div>

        {/* Interactive 3D Flip Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-64 w-full rounded-2xl bg-gradient-to-br from-surface to-[#1A0A0E] border-2 border-forge/40 hover:border-forge transition-all duration-300 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-glow select-none group"
        >
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-txt-muted">
            <span className="text-forge font-bold">{isFlipped ? "[ ANSWER ]" : "[ PROMPT ]"}</span>
            <span className="flex items-center gap-1 group-hover:text-txt-primary transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              Click to Flip
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <p className={`font-medium transition-all ${isFlipped ? "text-sm text-txt-primary leading-relaxed" : "text-base font-bold text-txt-primary"}`}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>

          <div className="text-[10px] font-mono text-txt-muted">
            {isFlipped ? "Tap card to view prompt again" : "Tap card to test your recall"}
          </div>
        </div>

        {/* Mastery Toggle & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant={isMastered ? "forge" : "outline"}
            size="sm"
            onClick={toggleMastered}
            className="text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {isMastered ? "Mastered" : "Mark as Mastered"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Prev
            </Button>

            {currentIndex === flashcards.length - 1 ? (
              <Button
                type="button"
                variant="forge"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold shadow-glow"
              >
                Complete Review
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleNext}
                className="text-xs font-semibold"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
