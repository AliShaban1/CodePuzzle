import { useDraggable } from "@dnd-kit/core";
import { PuzzlePieceProps } from "@/types/puzzle";

export default function PuzzlePiece({ block }: PuzzlePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: block.id.toString(),
    });

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
      className="p-4 bg-white mb-2 rounded shadow text-left font-mono cursor-pointer hover:bg-gray-200 transition"
    >
      {block.code}
    </div>
  );
}
