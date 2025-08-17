import { Label } from "@/components/ui/label"; // Gunakan label yang benar
import { Input } from "@/components/ui/input";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState, ChangeEvent } from "react";

export default function TaskName() {
  const [taskName, setTaskName] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTaskName(value);

    // Validasi
    if (value.trim() === "") {
      setError("Task name is required");
    } else if (value.length < 3) {
      setError("Task name must be at least 3 characters");
    } else if (value.length > 50) {
      setError("Task name must be less than 50 characters");
    } else {
      setError("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="opacity-75 text-sm font-medium">Task Title</Label>
      <Input
        placeholder="Enter task name..."
        className={`h-11 ${error ? "border-red-500" : ""}`}
        value={taskName}
        onChange={handleChange}
      />

      {/* Error container - only show when there's an error */}
      {error && (
        <div className="text-red-500 text-[12px] flex items-center gap-1">
          <FaCircleExclamation />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
