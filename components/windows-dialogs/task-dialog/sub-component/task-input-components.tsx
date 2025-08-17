import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState, ChangeEvent } from "react";

// TaskName Component
interface TaskNameProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskName({ value, onChange }: TaskNameProps) {
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Validasi
    if (inputValue.trim() === "") {
      setError("Task name is required");
    } else if (inputValue.length < 3) {
      setError("Task name must be at least 3 characters");
    } else if (inputValue.length > 50) {
      setError("Task name must be less than 50 characters");
    } else {
      setError("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Task Title</Label>
      <Input
        placeholder="Enter task name..."
        className={`h-11 ${error ? "border-red-500" : ""}`}
        value={value}
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

// TaskDescription Component
interface TaskDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskDescription({ value, onChange }: TaskDescriptionProps) {
  const [hasError, setHasError] = useState(false);
  const maxLength = 200;

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const textInput = e.target.value;

    if (textInput.length <= maxLength) {
      onChange(textInput);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Task Description</Label>
      <Textarea
        value={value}
        onChange={handleTextChange}
        placeholder="Give a description of the task..."
        className={`resize-none min-h-[100px] ${
          hasError ? "border-red-500" : ""
        }`}
      />

      <div className="flex justify-between items-center">
        {/* Error container - only show when there's an error */}
        {hasError && (
          <div className="text-red-500 text-[12px] flex items-center gap-1">
            <FaCircleExclamation />
            <p>Maximum {maxLength} characters allowed</p>
          </div>
        )}

        {/* Character counter */}
        <div className="ml-auto">
          <p
            className={`text-[12px] ${
              value.length > maxLength * 0.8
                ? "text-orange-500"
                : "text-muted-foreground"
            }`}
          >
            {value.length} / {maxLength} Characters
          </p>
        </div>
      </div>
    </div>
  );
}
