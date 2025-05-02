import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PuzzleBlock } from "@/types/puzzle";
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import PuzzlePiece from "@/components/PuzzlePiece";
import UserAnswerArea from "@/components/AnswerArea";
import dynamic from "next/dynamic";

export default function Puzzle() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [puzzleBlocks, setPuzzleBlocks] = useState<PuzzleBlock[]>([]);
  const [userBlocks, setUserBlocks] = useState<PuzzleBlock[]>([]);
  const [maxIndentation, setMaxIndentation] = useState(0);
  const [highlightedIndent, setHighlightedIndent] = useState<number | null>(
    null
  );
  const [history, setHistory] = useState<
    { user: PuzzleBlock[]; puzzle: PuzzleBlock[] }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    { user: PuzzleBlock[]; puzzle: PuzzleBlock[] }[]
  >([]);
  const [hintedBlockId, setHintedBlockId] = useState<string | null>(null);
  const [isHintDisabled, setIsHintDisabled] = useState(false);
  const [incorrectBlocks, setIncorrectBlocks] = useState<PuzzleBlock[]>([]);

  useEffect(() => {
    const savedTask = localStorage.getItem("task");
    const puzzles = localStorage.getItem("puzzleBlocks");
    const savedPuzzleBlocks = localStorage.getItem("savedPuzzleBlocks");
    const savedUserBlocks = localStorage.getItem("savedUserBlocks");

    if (!savedTask || !puzzles) {
      alert("No puzzle found. Please generate a task first.");
      router.push("/");
    } else {
      setTask(savedTask);
      let parsedBlocks: PuzzleBlock[] = [];
      if (puzzles) {
        parsedBlocks = JSON.parse(puzzles);
        setPuzzleBlocks(parsedBlocks);
      }
      if (savedUserBlocks && savedUserBlocks !== "[]") {
        const parsedUserBlocks = JSON.parse(savedUserBlocks);
        setUserBlocks(parsedUserBlocks);
      }
      if (savedPuzzleBlocks && savedPuzzleBlocks !== "[]") {
        const parsedPuzzleBlocks = JSON.parse(savedPuzzleBlocks);
        setPuzzleBlocks(parsedPuzzleBlocks);
      }
      // only allow indentations up to max correct indentation
      const maxIndent = parsedBlocks.reduce(
        (max: number, block: PuzzleBlock) => Math.max(max, block.indentation),
        0
      );
      setMaxIndentation(maxIndent);
    }
  }, [router]);

  useEffect(() => {
    localStorage.setItem("savedUserBlocks", JSON.stringify(userBlocks));
    localStorage.setItem("savedPuzzleBlocks", JSON.stringify(puzzleBlocks));
  }, [userBlocks, puzzleBlocks]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoStack((r) => [...r, { user: userBlocks, puzzle: puzzleBlocks }]);
    setUserBlocks(prev.user);
    setPuzzleBlocks(prev.puzzle);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setHistory((prev) => [...prev, { user: userBlocks, puzzle: puzzleBlocks }]);
    setUserBlocks(next.user);
    setPuzzleBlocks(next.puzzle);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(navigator.userAgent);
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

      // Undo
      if ((e.ctrlKey || (isMac && e.metaKey)) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        (e.ctrlKey && e.key === "y") ||
        (isMac && e.metaKey && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleCheckAnswer = () => {
    // Check the correctness of each block:
    // 1. Each block needs to be in the correct indentation level
    // 2. Each block needs to be in the correct position
    // 3. Duplicate blocks can replace each other
    const incorrectBlocks = userBlocks.filter((block, index) => {
      const correctBlock = userBlocks.find((b) => b.id === index);
      return (
        block != correctBlock &&
        (block.code != correctBlock?.code ||
          block.currentIndentation != correctBlock?.indentation)
      );
    });
    if (puzzleBlocks.length > 0) {
      alert(
        "Some blocks are still in the puzzle area. Please move them to your answer area."
      );
      return;
    }
    if (incorrectBlocks.length === 0) {
      alert("✅ All blocks are correctly placed!");
    } else {
      setIncorrectBlocks(incorrectBlocks);
      setTimeout(() => {
        setIncorrectBlocks([]);
      }, 5000);
      alert("Some blocks are incorrectly placed.");
    }
  };

  const handleHint = () => {
    if (isHintDisabled) return;

    const incorrectBlocks = userBlocks.filter((block, index) => {
      let correctBlock = userBlocks.find((b) => b.id === index);
      if (!correctBlock) {
        correctBlock = puzzleBlocks.find((b) => b.id === index);
      }
      return (
        (block.id !== index ||
          block.currentIndentation !== block.indentation) &&
        (block.code !== correctBlock?.code ||
          block.currentIndentation !== correctBlock?.indentation)
      );
    });

    if (incorrectBlocks.length === 0 && puzzleBlocks.length === 0) {
      alert("All blocks are correctly placed!");
      return;
    } else if (incorrectBlocks.length === 0) {
      alert(
        "Some blocks are still in the puzzle area. Please move them to your answer area."
      );
      return;
    }
    // Choose a random incorrect block to hint
    const incorrectIndex = Math.floor(Math.random() * incorrectBlocks.length);
    const hintBlock = incorrectBlocks[incorrectIndex];
    setHintedBlockId(hintBlock.id.toString());

    setIsHintDisabled(true);
    setTimeout(() => {
      setHintedBlockId(null);
      setIsHintDisabled(false);
    }, 10000);
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
        setHistory((prev) => [
          ...prev,
          { user: userBlocks, puzzle: puzzleBlocks },
        ]);
        setRedoStack([]); // clear redo stack on new action
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
        setHistory((prev) => [
          ...prev,
          { user: userBlocks, puzzle: puzzleBlocks },
        ]);
        setRedoStack([]); // clear redo stack on new action
        setUserBlocks(updated);
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Arrange the Code!</h1>
      <p className="mb-8 text-gray-600 text-center max-w-2xl">{task}</p>

      <DndContext onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
        <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 mb-8 z-0">
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
            hintedBlockId={hintedBlockId}
            incorrectBlocks={incorrectBlocks}
          />
        </div>
      </DndContext>

      {/* CONTROL BUTTONS */}
      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleUndo}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          ⬅️ Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          ➡️ Redo
        </button>
        <button
          onClick={handleCheckAnswer}
          className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          ✅ Check Answer
        </button>
        <button
          onClick={handleHint}
          className={`px-5 py-2 rounded-lg shadow transition ${
            isHintDisabled
              ? "bg-yellow-300 text-yellow-800 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
          disabled={isHintDisabled}
        >
          💡 {isHintDisabled ? "Hint Disabled" : "Get Hint"}
        </button>
      </div>
    </main>
  );
}
