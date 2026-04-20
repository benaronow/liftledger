"use client";

import { COLORS } from "@/lib/colors";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";

interface Props {
  label?: string;
  value: string;
  options: string[];
  unavailableOptions?: string[];
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
  unavailableOptions,
  onSelect,
  onAddCustom,
  className,
  disabled,
  placeholder,
}: Props) => {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const isUnavailable = useMemo(
    () =>
      inputValue.trim() !== "" &&
      unavailableOptions?.some(
        (o) => o.toLowerCase() === inputValue.trim().toLowerCase(),
      ),
    [inputValue, unavailableOptions],
  );

  const isCustom = useMemo(
    () =>
      inputValue.trim() !== "" &&
      !isUnavailable &&
      !options.some((o) => o.toLowerCase() === inputValue.trim().toLowerCase()),
    [inputValue, options],
  );

  const showDropdown =
    open && (filteredOptions.length > 0 || isCustom || isUnavailable);

  const addButtonText = useMemo(
    () =>
      isUnavailable
        ? `"${inputValue.trim()}" is unavailable`
        : `Add "${inputValue.trim()}"`,
    [isUnavailable, inputValue],
  );

  const handleSelect = (option: string) => {
    setInputValue(option);
    onSelect(option);
    setOpen(false);
  };

  const handleAddCustom = async () => {
    setAddingCustom(true);

    const trimmed = inputValue.trim();
    try {
      await onAddCustom?.(trimmed);
      onSelect(trimmed);
    } catch {
      setInputValue("");
    }

    setAddingCustom(false);
    setOpen(false);
  };

  const optionBg = (option: string) => {
    if (option === value) return COLORS.primary;
    return COLORS.dark;
  };

  return (
    <div className={`d-flex flex-column align-items-start w-100 ${className}`}>
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
          onBlur={() => setOpen(false)}
          disabled={disabled}
          placeholder={placeholder}
        />
        {showDropdown && (
          <div
            onMouseDown={(e) => e.preventDefault()}
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
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  className="d-flex px-2 py-1 border-0 w-100 justify-content-start"
                  style={{
                    fontSize: "14px",
                    background: optionBg(option),
                    color: "white",
                  }}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))}
              {(isUnavailable || isCustom) && (
                <button
                  className="px-2 py-1 border-0"
                  style={{
                    fontSize: 14,
                    background: COLORS.dark,
                    color: COLORS.primary,
                  }}
                  onClick={handleAddCustom}
                  disabled={isUnavailable}
                >
                  {addingCustom ? (
                    <Spinner size="sm" animation="border" variant="light" />
                  ) : (
                    addButtonText
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
