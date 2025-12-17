import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TRIGGER_OPTIONS } from "./notification-data";

export function EmailPushHeader() {
  return (
    <div className="flex justify-end gap-8 px-4 mb-2 text-sm font-medium text-muted-foreground">
      <span className="w-8 text-center">Email</span>
      <span className="w-8 text-center">Push</span>
    </div>
  );
}

export function NotificationRowWithSelect({
  label,
  selectValue,
  onSelectChange,
  emailChecked,
  onEmailChange,
  pushChecked,
  onPushChange,
}: {
  label: React.ReactNode;
  selectValue: string;
  onSelectChange: (val: string) => void;
  emailChecked: boolean;
  onEmailChange: (val: boolean) => void;
  pushChecked: boolean;
  onPushChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="flex-1 text-sm text-foreground flex items-center whitespace-nowrap mr-2">
        {label}
      </div>

      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60" />

      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <Select value={selectValue} onValueChange={onSelectChange}>
          <SelectTrigger className="w-[90px] h-8 text-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-8 px-2">
          <div className="w-8 flex justify-center">
            <Checkbox
              checked={emailChecked}
              onCheckedChange={(checked) => onEmailChange(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
          <div className="w-8 flex justify-center">
            <Checkbox
              checked={pushChecked}
              onCheckedChange={(checked) => onPushChange(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationRowSimple({
  label,
  emailChecked,
  onEmailChange,
  pushChecked,
  onPushChange,
}: {
  label: React.ReactNode;
  emailChecked: boolean;
  onEmailChange: (val: boolean) => void;
  pushChecked: boolean;
  onPushChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-3 sm:gap-0">
      <div className="text-sm text-foreground whitespace-nowrap mr-2">
        {label}
      </div>

      <div className="hidden sm:block flex-1 border-b border-border border-dashed mx-2 h-1 relative top-[2px] opacity-60" />

      <div className="flex items-center justify-end gap-8 px-2">
        <div className="w-8 flex justify-center">
          <Checkbox
            checked={emailChecked}
            onCheckedChange={(checked) => onEmailChange(checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
        <div className="w-8 flex justify-center">
          <Checkbox
            checked={pushChecked}
            onCheckedChange={(checked) => onPushChange(checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

export function NotificationToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-border/50 border-dashed w-full min-w-[20px] mx-4 hidden sm:block" />
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

