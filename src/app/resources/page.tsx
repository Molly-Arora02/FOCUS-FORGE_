"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Upload,
  Calendar,
  Youtube,
  FileText,
  Trash2,
  Sparkles,
  Plus,
  Play,
  ArrowRight,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  Flame,
  Brain,
  Layers,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { ResourceItem } from "@/types";
import { soundEngine } from "@/lib/audio/sound-engine";
import confetti from "canvas-confetti";

interface Flashcard {
  id: string;
  concept: string;
  question: string;
  answer: string;
  difficulty?: "again" | "hard" | "good" | "easy";
  timesReviewed?: number;
}

const DEFAULT_FLASHCARD_DECKS: Record<string, Flashcard[]> = {
  "Algorithms & Data Structures": [
    {
      id: "algo-1",
      concept: "Dijkstra vs A* Algorithm",
      question: "What is the primary difference between Dijkstra's algorithm and the A* search algorithm?",
      answer: "Dijkstra is an uninformed search exploring in all directions uniformly, while A* uses a heuristic function h(n) to guide the search toward the target, significantly pruning unnecessary state explorations.",
    },
    {
      id: "algo-2",
      concept: "Time Complexity of Red-Black Trees",
      question: "What guarantees the O(log N) search, insert, and delete performance of a Red-Black Tree?",
      answer: "The tree maintains self-balancing invariants: no two consecutive red nodes, root and leaves are black, and every path from root to leaf contains equal black node depth.",
    },
    {
      id: "algo-3",
      concept: "Dynamic Programming Invariants",
      question: "What two properties must a problem satisfy for Dynamic Programming to be applicable?",
      answer: "1. Optimal Substructure (optimal solution to the problem contains optimal solutions to subproblems).\n2. Overlapping Subproblems (subproblems are computed repeatedly rather than generating new subproblems).",
    },
  ],
  "Distributed Systems": [
    {
      id: "dist-1",
      concept: "Raft Consensus Protocol",
      question: "How does the Raft consensus algorithm handle leader election split votes?",
      answer: "Raft utilizes randomized election timeouts (e.g., 150ms-300ms) for candidates, ensuring that one candidate will almost always time out first and collect the quorum vote before another splits.",
    },
    {
      id: "dist-2",
      concept: "CAP Theorem Trade-offs",
      question: "Why is Consistency and Availability mutually exclusive during a Network Partition?",
      answer: "When a partition occurs (P), you must choose either to reject requests to maintain strict global consistency (CP), or continue answering requests with potentially stale/divergent state (AP).",
    },
  ],
  "Deep Focus & Cognitive Science": [
    {
      id: "cog-1",
      concept: "Attention Residue Effect",
      question: "What is Dr. Sophie Leroy's 'Attention Residue' and how does it hurt focus?",
      answer: "When switching from Task A to Task B, your cognitive attention does not immediately follow. A residue of thoughts remains on Task A, drastically reducing working memory and performance on Task B.",
    },
    {
      id: "cog-2",
      concept: "Binaural 40Hz Gamma Waves",
      question: "What cognitive mechanism does 40Hz auditory stimulation target?",
      answer: "40Hz gamma frequency entrains cortical oscillations, promoting synchronized neuronal firing in the prefrontal cortex associated with working memory, attention, and sensory binding.",
    },
  ],
};

export default function ResourcesPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"flashcards" | "resources">("flashcards");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Flashcards state
  const [decks, setDecks] = useState<Record<string, Flashcard[]>>(DEFAULT_FLASHCARD_DECKS);
  const [selectedDeckName, setSelectedDeckName] = useState<string>("Algorithms & Data Structures");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStats, setStudyStats] = useState({ reviewed: 0, mastered: 0 });

  // AI Flashcard Generator Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genSubject, setGenSubject] = useState("");
  const [genTopic, setGenTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Upload / Add Resource Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resourceType, setResourceType] = useState<"timetable" | "syllabus" | "lecture" | "notes">("timetable");
  const [rawText, setRawText] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedSchedule, setExtractedSchedule] = useState<any[]>([]);

  useEffect(() => {
    async function loadResources() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/resources?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error("Resource load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [user]);

  const activeCards = decks[selectedDeckName] || [];
  const currentCard = activeCards[currentCardIndex] || null;

  const handleFlipCard = () => {
    soundEngine.playChime("click");
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = (rating: "again" | "hard" | "good" | "easy") => {
    soundEngine.playChime("click");
    setStudyStats((prev) => ({
      reviewed: prev.reviewed + 1,
      mastered: rating === "good" || rating === "easy" ? prev.mastered + 1 : prev.mastered,
    }));

    setIsFlipped(false);

    if (currentCardIndex + 1 < activeCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // Completed deck!
      soundEngine.playChime("reward");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      alert(`🎉 Fantastic job! You completed all ${activeCards.length} cards in "${selectedDeckName}". +25 Forge Points!`);
      setCurrentCardIndex(0);
    }
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGenerating(true);
    soundEngine.playChime("click");

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: genSubject.trim() || "Deep Studies",
          topic: genTopic.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const deckKey = genTopic.trim();
        const newCards: Flashcard[] = (data.flashcards || []).map((c: any, i: number) => ({
          id: `gen-${Date.now()}-${i}`,
          concept: c.concept || "Key Concept",
          question: c.question,
          answer: c.answer,
        }));

        setDecks((prev) => ({
          [deckKey]: newCards,
          ...prev,
        }));
        setSelectedDeckName(deckKey);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setIsGenerateModalOpen(false);
        setGenTopic("");
        setGenSubject("");
        soundEngine.playChime("complete");
      }
    } catch (err) {
      console.error("Flashcard generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setUploading(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          fileName: fileName.trim(),
          resourceType,
          url: url.trim() || undefined,
          rawTextContent: rawText.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data.resource, ...prev]);
        if (data.extractedSchedule && data.extractedSchedule.length > 0) {
          setExtractedSchedule(data.extractedSchedule);
        } else {
          setIsAddOpen(false);
          setFileName("");
          setRawText("");
          setUrl("");
        }
      }
    } catch (err) {
      console.error("Error creating resource:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  const handleSyncExtractedSchedule = async () => {
    for (const block of extractedSchedule) {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          title: `${block.day}: ${block.title}`,
          estimatedDuration: 45,
          priority: "medium",
        }),
      });
    }
    alert("Extracted timetable blocks successfully added to your agenda!");
    setExtractedSchedule([]);
    setIsAddOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
        {/* Top Header & Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-forge" />
              Interactive Study Decks & Resources
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Active recall 3D flashcards with Leitner spaced repetition, timetable ingestion, and study assets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-surface-card border border-surface-border">
              <button
                type="button"
                onClick={() => setActiveTab("flashcards")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "flashcards"
                    ? "bg-forge text-surface-DEFAULT shadow-glow"
                    : "text-txt-secondary hover:text-txt-primary"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>3D Flashcards</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "resources"
                    ? "bg-forge text-surface-DEFAULT shadow-glow"
                    : "text-txt-secondary hover:text-txt-primary"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Files & Timetables</span>
              </button>
            </div>

            {activeTab === "flashcards" ? (
              <Button
                variant="forge"
                size="md"
                onClick={() => setIsGenerateModalOpen(true)}
                className="font-bold shadow-glow text-xs"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI Generate Deck
              </Button>
            ) : (
              <Button
                variant="forge"
                size="md"
                onClick={() => setIsAddOpen(true)}
                className="font-bold shadow-glow text-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Resource / Parse Timetable
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: 3D FLASHCARD STUDY DECK */}
        {activeTab === "flashcards" && (
          <div className="space-y-6">
            {/* Deck Selector & Progress Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card/80 border border-surface-border backdrop-blur-md">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
                <span className="text-xs font-mono text-txt-muted shrink-0 mr-1">Select Deck:</span>
                {Object.keys(decks).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSelectedDeckName(name);
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedDeckName === name
                        ? "bg-forge/20 border-forge text-forge shadow-glow"
                        : "bg-surface border-surface-border text-txt-secondary hover:text-txt-primary"
                    }`}
                  >
                    {name} ({decks[name]?.length || 0})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="flex items-center gap-1.5 text-txt-secondary">
                  <span className="text-forge font-bold">{studyStats.reviewed}</span> Reviewed
                </div>
                <div className="flex items-center gap-1.5 text-txt-secondary">
                  <span className="text-emerald-400 font-bold">{studyStats.mastered}</span> Mastered
                </div>
              </div>
            </div>

            {/* 3D Flashcard Interactive Arena */}
            {currentCard ? (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Progress Bar & Counter */}
                <div className="flex items-center justify-between text-xs font-mono text-txt-muted px-1">
                  <span>
                    Card {currentCardIndex + 1} of {activeCards.length}
                  </span>
                  <span>{Math.round(((currentCardIndex + 1) / activeCards.length) * 100)}% Completed</span>
                </div>

                <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden border border-surface-border">
                  <div
                    className="bg-forge h-full transition-all duration-300 shadow-glow"
                    style={{ width: `${((currentCardIndex + 1) / activeCards.length) * 100}%` }}
                  />
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={handleFlipCard}
                  className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px]"
                >
                  <Card
                    className={`w-full h-full min-h-[300px] sm:min-h-[340px] p-6 sm:p-8 flex flex-col justify-between rounded-3xl transition-all duration-300 transform shadow-glow-card relative border ${
                      isFlipped
                        ? "bg-gradient-to-br from-surface-hover via-surface-card to-forge/10 border-forge/50"
                        : "bg-gradient-to-br from-surface-card via-surface to-surface-hover border-surface-border"
                    }`}
                  >
                    {/* Card Concept Pill */}
                    <div className="flex items-center justify-between">
                      <Badge variant="forge" size="sm" className="font-mono text-[10px] uppercase">
                        {currentCard.concept}
                      </Badge>
                      <span className="text-xs font-mono text-txt-muted flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Click to {isFlipped ? "view Question" : "Reveal Answer"}
                      </span>
                    </div>

                    {/* Content Display */}
                    <div className="my-auto py-6">
                      {!isFlipped ? (
                        <div className="space-y-3">
                          <p className="text-[11px] font-mono uppercase text-txt-muted tracking-wider">Question</p>
                          <h2 className="text-lg sm:text-xl font-bold text-txt-primary leading-relaxed">
                            {currentCard.question}
                          </h2>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <p className="text-[11px] font-mono uppercase text-forge font-bold tracking-wider">
                            Answer & Key Mechanism
                          </p>
                          <p className="text-sm sm:text-base font-medium text-txt-primary leading-relaxed whitespace-pre-line">
                            {currentCard.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="pt-4 border-t border-surface-border/50 flex items-center justify-between text-xs text-txt-muted">
                      <span>{selectedDeckName}</span>
                      <span className="text-forge font-semibold">Active Recall Protocol</span>
                    </div>
                  </Card>
                </div>

                {/* Spaced Repetition Grading Buttons */}
                {isFlipped ? (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 animate-in slide-in-from-bottom-2 duration-200">
                    <button
                      type="button"
                      onClick={() => handleRateCard("again")}
                      className="p-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold text-center active:scale-95"
                    >
                      <span className="block">Again</span>
                      <span className="text-[10px] opacity-75 font-mono">&lt; 1 min</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard("hard")}
                      className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold text-center active:scale-95"
                    >
                      <span className="block">Hard</span>
                      <span className="text-[10px] opacity-75 font-mono">10 min</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard("good")}
                      className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/40 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold text-center active:scale-95"
                    >
                      <span className="block">Good</span>
                      <span className="text-[10px] opacity-75 font-mono">1 day</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard("easy")}
                      className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold text-center active:scale-95"
                    >
                      <span className="block">Easy</span>
                      <span className="text-[10px] opacity-75 font-mono">4 days</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Button
                      variant="forge"
                      size="lg"
                      onClick={handleFlipCard}
                      className="w-full font-bold shadow-glow text-sm py-6 rounded-2xl"
                    >
                      Reveal Answer (Spacebar / Click)
                    </Button>
                  </div>
                )}

                {/* Card Navigation Arrows */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    className="text-xs"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous Card
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentCardIndex + 1 >= activeCards.length}
                    onClick={() => {
                      setCurrentCardIndex((prev) => Math.min(activeCards.length - 1, prev + 1));
                      setIsFlipped(false);
                    }}
                    className="text-xs"
                  >
                    Next Card <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Brain className="w-12 h-12 text-txt-muted mx-auto" />
                <p className="text-txt-secondary text-sm">No flashcards in this deck yet.</p>
                <Button variant="forge" size="md" onClick={() => setIsGenerateModalOpen(true)}>
                  Generate with AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTACHED RESOURCES & TIMETABLE PARSER */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => {
                const isTimetable = res.resourceType === "timetable";
                const isYouTube = res.provider === "youtube";

                return (
                  <Card
                    key={res._id}
                    className="p-6 space-y-4 bg-surface-card border-surface-border hover:border-forge/40 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-forge/15 border border-forge/30 flex items-center justify-center text-forge shadow-glow">
                          {isYouTube ? (
                            <Youtube className="w-5 h-5 text-status-error" />
                          ) : isTimetable ? (
                            <Calendar className="w-5 h-5 text-forge" />
                          ) : (
                            <FileText className="w-5 h-5 text-forge" />
                          )}
                        </div>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                          {res.resourceType}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-txt-primary truncate">{res.fileName}</h3>
                        <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2">
                          {res.contentSnippet || res.url || "Attached learning asset"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs">
                      {res.url ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forge hover:underline font-mono inline-flex items-center gap-1"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-txt-muted font-mono">Internal Document</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res._id)}
                        className="text-txt-muted hover:text-status-error transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Flashcard Deck Generator Modal */}
        {isGenerateModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forge" />
                  Generate AI Flashcard Deck
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-txt-muted hover:text-txt-primary text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerateDeck} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">Subject (e.g. Computer Science)</label>
                  <Input
                    placeholder="Computer Science, Biology, Finance..."
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-txt-secondary">
                    Topic / Sub-Topic to Test In-Depth
                  </label>
                  <Input
                    placeholder="e.g. Graph Algorithms, Neural Attention Mechanisms, Microeconomics"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-txt-muted">
                    AI synthesizes rigorous conceptual, algorithmic, and edge-case question cards.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="forge" size="sm" isLoading={isGenerating} className="font-bold shadow-glow">
                    Synthesize Flashcards
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Timetable Parser & Add Resource Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-glow-card animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forge" />
                  Add Resource / Parse Timetable
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-txt-muted hover:text-txt-primary text-xs"
                >
                  ✕
                </button>
              </div>

              {extractedSchedule.length > 0 ? (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-forge/10 border border-forge/30 text-xs text-forge">
                    <p className="font-bold">Successfully Parsed {extractedSchedule.length} Schedule Blocks!</p>
                    <p className="text-txt-secondary text-[11px] mt-0.5">
                      Sync these timetable items directly into your task agenda.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {extractedSchedule.map((b, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-txt-primary">{b.title}</p>
                          <p className="text-[11px] text-txt-muted font-mono">{b.day} • {b.time}</p>
                        </div>
                        <Badge variant="outline" size="sm">
                          {b.subject}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                    <Button variant="ghost" size="sm" onClick={() => setExtractedSchedule([])}>
                      Re-enter Text
                    </Button>
                    <Button variant="forge" size="sm" onClick={handleSyncExtractedSchedule} className="font-bold shadow-glow">
                      Confirm & Sync to Agenda
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Resource Title / File Name</label>
                    <Input
                      placeholder="e.g. Spring 2026 CS Timetable"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-txt-secondary">Resource Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["timetable", "syllabus", "lecture", "notes"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setResourceType(t)}
                          className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                            resourceType === t
                              ? "bg-forge/15 border-forge text-forge font-bold"
                              : "bg-surface-card border-surface-border text-txt-muted hover:border-surface-border"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {resourceType === "timetable" ? (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-txt-secondary">
                        Paste Timetable Text or Schedule Snippet
                      </label>
                      <Textarea
                        placeholder="Monday: 10:00 AM - Algorithms Lecture&#10;Wednesday: 02:00 PM - Distributed Systems Lab&#10;Friday: 11:00 AM - Database Systems Recitation"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="h-28 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-txt-secondary">Resource URL (Optional)</label>
                      <Input
                        placeholder="https://youtube.com/watch?v=... or Google Doc link"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="forge" size="sm" isLoading={uploading} className="font-bold shadow-glow">
                      {resourceType === "timetable" ? "Parse Timetable with AI" : "Save Resource"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
