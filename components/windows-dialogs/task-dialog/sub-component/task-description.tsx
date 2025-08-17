import { Label } from "@/components/ui/label"; // Gunakan label yang benar
import { FaCircleExclamation } from "react-icons/fa6";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState } from "react";

export default function TaskDescription() {
  const [textValue, setTextValue] = useState("");
  const [hasError, setHasError] = useState(false);
  const maxLength = 200; // Increase limit for better UX

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const textInput = e.target.value;

    if (textInput.length <= maxLength) {
      setTextValue(textInput);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Label className="opacity-75 text-sm font-medium">Task Description</Label>
      <Textarea
        value={textValue}
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
              textValue.length > maxLength * 0.8
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            {textValue.length} / {maxLength} Characters
          </p>
        </div>
      </div>
    </div>
  );
}
