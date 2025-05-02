import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { UserAnswerAreaProps } from "@/types/puzzle";
import SortableUserBlock from "./SortableUserBlock";

export default function UserAnswerArea({
  id,
  userBlocks,
  maxIndentationLevel,
  highlightedIndent,
  hintedBlockId,
  incorrectBlocks,
}: UserAnswerAreaProps) {
  const { setNodeRef, over } = useDroppable({
    id,
  });

  return (
    <div
      id={id}
      ref={setNodeRef}
      className="relative flex-1 bg-gray-100 p-4 rounded min-h-[300px]"
    >
      <h2 className="text-xl text-center font-bold mb-4 rounded">
        Your Answer
      </h2>

      {/* BACKGROUND ZONES FOR INDENTATION */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        {Array.from({ length: maxIndentationLevel }).map((_, index) => (
          <div
            key={index}
            className={`w-[40px] ${
              highlightedIndent !== null && index >= highlightedIndent && over
                ? "bg-gray-300/40"
                : ""
            }`}
          />
        ))}
        <div
          className={`flex-1 ${
            highlightedIndent !== null && over ? "bg-gray-300/40" : ""
          }`}
        />
      </div>

      {/* CODE BLOCKS */}
      <SortableContext
        items={userBlocks.map((block) => block.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {userBlocks.map((block, index) => (
          <SortableUserBlock
            key={block.id}
            block={block}
            hinted={JSON.stringify(block.id) == hintedBlockId}
            currentIndex={index}
            incorrect={incorrectBlocks.includes(block)}
          />
        ))}
      </SortableContext>
    </div>
  );
}
