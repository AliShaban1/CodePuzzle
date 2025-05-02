import { useDraggable } from "@dnd-kit/core";
import { PuzzlePieceProps } from "@/types/puzzle";
import { useState } from "react";
import dynamic from "next/dynamic";
const SafeMonaco = dynamic(() => import("./MonacoEditor"), { ssr: false });

export default function PuzzlePiece({ block }: PuzzlePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: block.id.toString(),
    });
  const [showTooltip, setShowTooltip] = useState(false);
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: transform ? 1000 : "auto",
    position: isDragging ? "relative" : "static",
    transition: "transform 50ms ease-out",
  };

  return (
    <div
      id={block.id.toString()}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-4 group bg-white mb-2 rounded shadow text-left font-mono cursor-pointer  transition"
    >
      <div className="flex items-center justify-between">
        <SafeMonaco value={block.code}></SafeMonaco>

        {/* Question mark icon – only visible on hover of the whole block */}
        <div
          className="relative ml-2 mr-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="text-lg font-bold cursor-help">?</span>

          {showTooltip && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 text-white text-sm p-2 rounded shadow-lg z-50">
              {block.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
