"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconTrash, IconDownload } from "@tabler/icons-react";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: { title: string; src: string; id?: string; onDelete?: (id: string) => void; onDownload?: (id: string) => void };
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex flex-col justify-between py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex justify-end gap-2">
          {card.id && card.onDownload && (
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                card.onDownload!(card.id!);
              }}
              className="h-8 w-8"
            >
              <IconDownload className="h-4 w-4" />
            </Button>
          )}
          {card.id && card.onDelete && (
            <Button
              size="icon"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                card.onDelete!(card.id!);
              }}
              className="h-8 w-8"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
  id?: string;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn(
      "grid gap-10 w-full mx-auto md:px-8",
      cards.length === 1
        ? "grid-cols-1 max-w-2xl place-items-center"
        : "grid-cols-1 md:grid-cols-3 max-w-5xl"
    )}>
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
