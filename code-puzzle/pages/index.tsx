import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [task, setTask] = useState("");

  const handleGenerate = () => {
    if (task.trim()) {
      // Save the task to be solved
      localStorage.setItem("task", task);
      router.push("/puzzle");
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
