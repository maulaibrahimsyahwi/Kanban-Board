import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";

interface TaskNameProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void; // Optional callback untuk Enter key
}

export default function TaskName({ value, onChange, onEnter }: TaskNameProps) {
  const [error, setError] = useState("");

  // Update error when value changes
  useEffect(() => {
    if (value.trim() === "") {
      setError("Task name is required");
    } else if (value.length < 3) {
      setError("Task name must be at least 3 characters");
    } else if (value.length > 30) {
      setError("Task name must be less than 30 characters");
    } else {
      setError("");
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter && !error && value.trim()) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="opacity-75 text-sm font-medium">Task Title</Label>
      <Input
        placeholder="Enter task name..."
        className={`h-11 ${error ? "border-red-500" : ""}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
