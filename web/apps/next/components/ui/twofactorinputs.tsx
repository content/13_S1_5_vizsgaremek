import { useRef } from "react";

interface TwoFactorInputsProps {
  values: string[];
  onChange: (index: number, value: string) => void;
}

const TwoFactorInputs = ({ values, onChange }: TwoFactorInputsProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/, ""); // only digits
    onChange(index, value);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={values[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="block p-3 w-full bg-zinc-700 rounded-lg text-center"
          maxLength={1}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
        />
      ))}
    </div>
  );
}

export default TwoFactorInputs;