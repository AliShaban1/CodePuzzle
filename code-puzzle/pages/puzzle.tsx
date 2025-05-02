import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PuzzleBlock } from "@/types/puzzle";
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import PuzzlePiece from "@/components/PuzzlePiece";
import UserAnswerArea from "@/components/AnswerArea";

export default function Puzzle() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [puzzleBlocks, setPuzzleBlocks] = useState<PuzzleBlock[]>([]);
  const [userBlocks, setUserBlocks] = useState<PuzzleBlock[]>([]);
  const [maxIndentation, setMaxIndentation] = useState(0);
  const [highlightedIndent, setHighlightedIndent] = useState<number | null>(
    null
  );

  useEffect(() => {
    const savedTask = localStorage.getItem("task");
    const savedBlocks = localStorage.getItem("puzzleBlocks");

    if (!savedTask || !savedBlocks) {
      alert("No puzzle found. Please generate a task first.");
      router.push("/");
    } else {
      setTask(savedTask);
      const parsedBlocks = JSON.parse(savedBlocks);
      setPuzzleBlocks(parsedBlocks);
      // only allow indentations up to max correct indentation
      const maxIndent = parsedBlocks.reduce(
        (max: number, block: PuzzleBlock) => Math.max(max, block.indentation),
        0
      );
      setMaxIndentation(maxIndent);
    }
  }, [router]);

  useEffect(() => {
    console.log("User Blocks Updated", userBlocks);
  }, [userBlocks]);

  const handleUndo = () => {};

  const handleRedo = () => {
    console.log("Redo action to be implemented");
  };

  const handleCheckAnswer = () => {
    console.log("Check Answer action to be implemented");
  };

  const handleHint = () => {
    console.log("Hint action to be implemented");
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const draggedBlockElement = document.getElementById(
      event.active.id.toString()
    );
    const userAreaElement = document.getElementById("user-area");
    if (!draggedBlockElement || !userAreaElement) return;

    const areaRect = userAreaElement.getBoundingClientRect();
    const blockRect = draggedBlockElement.getBoundingClientRect();
    const indentSize = 40;

    const relativeX = blockRect.left - areaRect.left;
    const indent = Math.floor(relativeX / indentSize);

    if (indent >= 0) {
      const highlighted = Math.min(indent, maxIndentation);
      setHighlightedIndent(highlighted);
    } else {
      setHighlightedIndent(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setHighlightedIndent(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const draggedFromPuzzle = puzzleBlocks.find(
      (block) => block.id.toString() === activeId
    );
    const draggedFromAnswer = userBlocks.find(
      (block) => block.id.toString() === activeId
    );
    // Calculate indentation level
    const userAreaElement = document.getElementById("user-area");
    const draggedBlockElement = document.getElementById(activeId);
    let calculatedIndentation = 0;

    if (userAreaElement && draggedBlockElement) {
      const rectAnswerArea = userAreaElement.getBoundingClientRect();
      const rectDraggedBlock = draggedBlockElement.getBoundingClientRect();
      const relativeX = rectDraggedBlock.left - rectAnswerArea.left;
      const indentSize = 40;
      calculatedIndentation = Math.min(
        maxIndentation,
        Math.max(0, Math.floor(relativeX / indentSize))
      );
    }

    if (draggedFromPuzzle) {
      // Dragging from left to answer area
      const newIndex = userBlocks.findIndex(
        (block) => block.id.toString() === overId
      );
      if (newIndex === -1) {
        setUserBlocks((prev) => [
          ...prev,
          {
            ...draggedFromPuzzle,
            currentIndentation: calculatedIndentation,
          },
        ]);
      } else {
        const newBlocks = [...userBlocks];
        newBlocks.splice(newIndex, 0, {
          ...draggedFromPuzzle,
          currentIndentation: calculatedIndentation,
        });
        setUserBlocks(newBlocks);
      }
      setPuzzleBlocks((prev) =>
        prev.filter((block) => block.id !== draggedFromPuzzle.id)
      );
    } else if (draggedFromAnswer) {
      // Rearranging in the answer area
      const oldIndex = userBlocks.findIndex(
        (block) => block.id.toString() === activeId
      );
      const newIndex = userBlocks.findIndex(
        (block) => block.id.toString() === overId
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const updated = arrayMove(userBlocks, oldIndex, newIndex);
        updated[newIndex] = {
          ...updated[newIndex],
          currentIndentation: calculatedIndentation,
        };
        setUserBlocks(updated);
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Arrange the Code!</h1>
      <p className="mb-8 text-gray-600 text-center max-w-2xl">{task}</p>

      <DndContext onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
        <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 mb-8 z-10 overflow-x-auto">
          {/* CODE PUZZLES */}
          <div className="flex-1 bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-bold text-center mb-4">
              Puzzle Pieces
            </h2>
            {puzzleBlocks.map((block) => (
              <PuzzlePiece key={block.id} block={block} />
            ))}
          </div>

          {/* ANSWER AREA */}
          <UserAnswerArea
            id="user-area"
            userBlocks={userBlocks}
            maxIndentationLevel={maxIndentation}
            highlightedIndent={highlightedIndent}
          />
        </div>
      </DndContext>

      {/* CONTROL BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={() => console.log("Undo action")}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Undo
        </button>
        <button
          onClick={() => console.log("Redo action")}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Redo
        </button>
        <button
          onClick={() => console.log("Check Answer action")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Answer
        </button>
        <button
          onClick={() => console.log("Hint action")}
          className="px-4 py-2 bg-yellow-400 rounded hover:bg-yellow-500"
        >
          Hint
        </button>
      </div>
    </main>
  );
}
