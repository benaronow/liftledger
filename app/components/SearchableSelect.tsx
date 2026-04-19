"use client";

import { COLORS } from "@/lib/colors";
import { useEffect, useRef, useState } from "react";

interface Props {
  label?: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  onAddCustom?: (value: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const SearchableSelect = ({
  label,
  value,
  options,
  onSelect,
  onAddCustom,
  className,
  disabled,
  placeholder,
}: Props) => {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const isCustom =
    inputValue.trim() !== "" &&
    !options.some((o) => o.toLowerCase() === inputValue.trim().toLowerCase());

  const handleSelect = (option: string) => {
    setInputValue(option);
    onSelect(option);
    setOpen(false);
  };

  const handleAddCustom = async () => {
    const trimmed = inputValue.trim();
    onSelect(trimmed);
    try {
      await onAddCustom?.(trimmed);
    } catch {
      setInputValue(value);
    }
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      setInputValue(value);
    }, 150);
  };

  const optionBg = (option: string) => {
    if (option === value) return COLORS.primary;
    if (option === hovered) return "#58585b";
    return "#131314";
  };

  return (
    <div
      className={`d-flex flex-column align-items-start w-100 ${className}`}
      ref={containerRef}
    >
      {label && (
        <span
          className="fw-semibold text-nowrap text-white mb-1"
          style={{ fontSize: "14px" }}
        >
          {label}
        </span>
      )}
      <div className="position-relative w-100">
        <input
          className="w-100 rounded px-2 py-1 border-0"
          style={{
            fontSize: "16px",
            outlineColor: COLORS.primary,
            background: "white",
            height: 35,
          }}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
        />
        {open && (filtered.length > 0 || isCustom) && (
          <div
            className="position-absolute w-100 rounded overflow-hidden"
            style={{
              top: "100%",
              left: 0,
              zIndex: 1000,
              border: "1px solid #58585b",
              boxShadow: "0px 0px 15px #131314",
              background: "#131314",
            }}
          >
            <div
              style={{
                background: "#131314",
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {filtered.map((option) => (
                <div
                  key={option}
                  className="px-2 py-1"
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    background: optionBg(option),
                    color: "white",
                    userSelect: "none",
                  }}
                  onMouseDown={() => handleSelect(option)}
                  onMouseEnter={() => setHovered(option)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {option}
                </div>
              ))}
              {isCustom && (
                <div
                  className="px-2 py-1"
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    color: COLORS.primary,
                    background:
                      hovered === "__custom__" ? "#58585b" : "#131314",
                    borderTop:
                      filtered.length > 0 ? "1px solid #58585b" : "none",
                    userSelect: "none",
                  }}
                  onMouseDown={handleAddCustom}
                  onMouseEnter={() => setHovered("__custom__")}
                  onMouseLeave={() => setHovered(null)}
                >
                  Add &quot;{inputValue.trim()}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
