import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessTypeSelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function BusinessTypeSelect({
  name,
  value,
  onChange,
}: BusinessTypeSelectProps) {
  return (
    <Select name={name} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select business type" />
      </SelectTrigger>
      <SelectContent>{/* TODO: Populate with business types */}</SelectContent>
    </Select>
  );
}
