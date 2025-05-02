import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PuzzlePieceProps } from "@/types/puzzle";

function SortableUserBlock({ block }: PuzzlePieceProps) {
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 50ms ease-out" : transition,
    marginLeft: `${block.currentIndentation * 2}rem`,
    zIndex: 1000,
    position: isDragging ? "relative" : "static",
  };

  return (
    <div
      id={block.id.toString()}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-4 bg-white rounded shadow text-left font-mono mb-2 cursor-move transition"
    >
      {block.code}
    </div>
  );
}

export default SortableUserBlock;
