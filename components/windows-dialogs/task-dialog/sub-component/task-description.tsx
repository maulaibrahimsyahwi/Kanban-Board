import { Label } from "@/components/ui/label";
import { FaCircleExclamation } from "react-icons/fa6";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState, useEffect, KeyboardEvent } from "react";

interface TaskDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  actionSlot?: React.ReactNode;
}

export default function TaskDescription({
  value,
  onChange,
  onEnter,
  actionSlot,
}: TaskDescriptionProps) {
  const [hasError, setHasError] = useState(false);
  const maxLength = 500;

  useEffect(() => {
    setHasError(value.length > maxLength);
  }, [value]);

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const textInput = e.target.value;

    if (textInput.length <= maxLength) {
      onChange(textInput);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onEnter && !hasError) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-between items-center">
        <Label className="opacity-75 text-sm font-medium">
          Task Description
        </Label>
        {actionSlot}
      </div>
      <Textarea
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Give a description of the task..."
        className={`resize-none min-h-[100px] max-h-[200px] overflow-y-auto ${
          hasError ? "border-red-500" : ""
        }`}
        maxLength={maxLength}
      />

      <div className="flex justify-between items-center">
        {hasError && (
          <div className="text-red-500 text-[12px] flex items-center gap-1">
            <FaCircleExclamation />
            <p>Maximum {maxLength} characters allowed</p>
          </div>
        )}

        <div className="ml-auto">
          <p
            className={`text-[12px] ${
              value.length > maxLength * 0.8
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            {value.length} / {maxLength} Characters
          </p>
        </div>
      </div>
    </div>
  );
}
