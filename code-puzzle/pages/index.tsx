import { useRouter } from "next/router";
import { useState } from "react";
import { shuffleArray } from "../lib/utils";
import { PuzzleBlock } from "@/types/puzzle";

export default function Home() {
  const router = useRouter();
  const [task, setTask] = useState("");

  const handleGenerate = async () => {
    // Check if task is not empty, otheriwse alert
    if (task.trim()) {
      // Save the task to be solved
      localStorage.setItem("task", task);
      // Check if apiKey is set
      let apiKey = localStorage.getItem("apiKey");
      if (!apiKey) {
        // Ask user for API key
        apiKey = window.prompt("Please enter your OpenAI API Key:");
        if (!apiKey) {
          alert("API key is required to generate the puzzle.");
          return;
        }
        localStorage.setItem("apiKey", apiKey);
      }
      // Call the chat api with the task and redirect to the puzzle page
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskDescription: task,
            apiKey: apiKey,
          }),
        });
        const data = await response.json();
        let cleanResult = data.result;
        if (cleanResult.startsWith("```")) {
          cleanResult = cleanResult
            .replace(/```(json)?/, "")
            .replace(/```/, "")
            .trim();
        }

        const puzzleBlocksRaw = JSON.parse(data.result);
        // Add IDs
        const puzzleBlocks: PuzzleBlock[] = puzzleBlocksRaw.map(
          (block: any, index: number) => ({
            id: index,
            code: block.code,
            explanation: block.explanation,
            indentation: block.indentation,
            currentIndentation: 0,
          })
        );
        const shuffledBlocks = shuffleArray(puzzleBlocks);
        localStorage.setItem("puzzleBlocks", JSON.stringify(shuffledBlocks));
        localStorage.removeItem("savedUserBlocks");
        localStorage.removeItem("savedPuzzleBlocks");
        router.push("/puzzle");
      } catch (error) {
        console.error("Error generating puzzle:", error);
        alert("Error generating puzzle. Please try again.");
      }
    } else {
      alert("Please enter a task description.");
    }
  };

  return (
    <main className="flex flex-col items-center p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-4 p-4">Code Puzzle Generator</h1>
      <textarea
        className="w-full h-32 p-2 border border-gray-300 rounded mb-4"
        placeholder="Describe the programming task you want to solve..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className=" bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate Puzzle
      </button>
    </main>
  );
}
