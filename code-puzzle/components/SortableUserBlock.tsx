import React, { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PuzzlePieceProps } from "@/types/puzzle";

function SortableUserBlock({
  block,
  hinted,
  currentIndex,
  incorrect,
}: PuzzlePieceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id.toString(),
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 50ms ease-out" : transition,
    marginLeft: `${block.currentIndentation * 2}rem`,
    zIndex: 1000,
    position: hinted ? "relative" : "static",
    border: hinted || incorrect ? "2px solid rgba(255, 0, 0, 0.5)" : undefined,
  };

  return (
    <div
      id={block.id.toString()}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="relative group p-4 bg-white rounded shadow text-left font-mono mb-2 cursor-move transition"
    >
      <div className="flex items-center justify-between">
        <span>{block.code}</span>

        {/* Question mark icon – only visible on hover of the whole block */}
        <div
          className="relative ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

      {/* Render arrows if this is the hinted block */}
      {hinted && (
        <>
          {/* Arrow Right for indentation */}
          {block.currentIndentation < block.indentation && (
            <div className="absolute right-[-1.5rem] top-1/2 transform -translate-y-1/2 text-red-500 text-xl">
              →
            </div>
          )}
          {/* Arrow Left for over-indentation */}
          {block.currentIndentation > block.indentation && (
            <div className="absolute left-[-1.5rem] top-1/2 transform -translate-y-1/2 text-red-500 text-xl">
              ←
            </div>
          )}
          {/* Arrow Down for misplaced vertical position */}
          {currentIndex && block.id > currentIndex && (
            <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-red-500 text-xl">
              ↓
            </div>
          )}
          {/* Arrow Up for block too low */}
          {currentIndex && block.id < currentIndex && (
            <div className="absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 text-red-500 text-xl">
              ↑
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SortableUserBlock;
