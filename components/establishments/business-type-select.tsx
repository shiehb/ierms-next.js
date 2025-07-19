import React from "react";

interface BusinessTypeSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function BusinessTypeSelect({ name, value, onChange }: BusinessTypeSelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded p-2"
    >
      <option value="">Select business type</option>
      {/* TODO: Populate with business types */}
    </select>
  );
} 