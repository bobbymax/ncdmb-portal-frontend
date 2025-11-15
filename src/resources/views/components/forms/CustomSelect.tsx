import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export interface CustomSelectOption {
  value: string | number;
  title: string; // Required
  avatar?: {
    type: "icon" | "image" | "text";
    content: string; // icon class, image URL, or text initials
  };
  type?: string;
  status?: {
    label: string;
    variant?: "success" | "warning" | "error" | "info" | "neutral";
  };
  user?: string;
  date?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value?: string | number | (string | number)[] | null;
  onChange?: (value: string | number | (string | number)[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  label?: string;
  isDisabled?: boolean;
  isSearchable?: boolean;
  className?: string;
  getOptionLabel?: (option: CustomSelectOption) => string;
  getOptionValue?: (option: CustomSelectOption) => string | number;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder = "Click to search...",
  label,
  isDisabled = false,
  isSearchable = true,
  className = "",
  getOptionLabel = (option) => option.title || "",
  getOptionValue = (option) => option.value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Normalize value to array for easier handling
  const selectedValues = useMemo(() => {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Get selected options
  const selectedOptions = useMemo(() => {
    return options.filter((opt) =>
      selectedValues.includes(getOptionValue(opt))
    );
  }, [options, selectedValues, getOptionValue]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => {
      const title = getOptionLabel(opt)?.toLowerCase() || "";
      const type = opt.type?.toLowerCase() || "";
      const user = opt.user?.toLowerCase() || "";
      return title.includes(term) || type.includes(term) || user.includes(term);
    });
  }, [options, searchTerm, getOptionLabel]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Update dropdown position
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) {
      setDropdownStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        maxHeight: 400,
        zIndex: 1200,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isDisabled) return;

      switch (event.key) {
        case "Enter":
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          } else {
            setIsOpen(true);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Backspace":
          if (!isOpen && multiple && selectedValues.length > 0) {
            const newValues = selectedValues.slice(0, -1);
            onChange?.(newValues.length > 0 ? newValues : null);
          }
          break;
      }
    },
    [
      isDisabled,
      isOpen,
      highlightedIndex,
      filteredOptions,
      multiple,
      selectedValues,
      onChange,
    ]
  );

  // Reset highlight when dropdown opens/closes or options change
  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions.length]);

  const handleSelectOption = useCallback(
    (option: CustomSelectOption) => {
      const optionValue = getOptionValue(option);

      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        onChange?.(newValues.length > 0 ? newValues : null);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    },
    [multiple, selectedValues, onChange, getOptionValue]
  );

  const handleRemoveSelected = useCallback(
    (optionValue: string | number, event: React.MouseEvent) => {
      event.stopPropagation();
      if (multiple) {
        const newValues = selectedValues.filter((v) => v !== optionValue);
        onChange?.(newValues.length > 0 ? newValues : null);
      }
    },
    [multiple, selectedValues, onChange]
  );

  const handleContainerClick = () => {
    if (!isDisabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const displayText = useMemo(() => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1)
        return getOptionLabel(selectedOptions[0]);
      return `${selectedOptions.length} items selected`;
    } else {
      const selected = options.find((opt) => getOptionValue(opt) === value);
      return selected ? getOptionLabel(selected) : placeholder;
    }
  }, [
    multiple,
    selectedOptions,
    placeholder,
    getOptionLabel,
    options,
    value,
    getOptionValue,
  ]);

  const renderAvatar = (option: CustomSelectOption) => {
    if (!option.avatar) return null;

    const { type, content } = option.avatar;

    switch (type) {
      case "icon":
        return (
          <div className="custom-select-option__avatar custom-select-option__avatar--icon">
            <i className={content} />
          </div>
        );
      case "image":
        return (
          <div className="custom-select-option__avatar custom-select-option__avatar--image">
            <img src={content} alt={option.title} />
          </div>
        );
      case "text":
        return (
          <div className="custom-select-option__avatar custom-select-option__avatar--text">
            {content}
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status?: CustomSelectOption["status"]) => {
    if (!status) return null;

    const variant = status.variant || "neutral";
    return (
      <span
        className={`custom-select-option__status custom-select-option__status--${variant}`}
      >
        {status.label}
      </span>
    );
  };

  return (
    <div className={`custom-select-wrapper ${className}`}>
      {label && <label className="custom-select-label">{label}</label>}
      <div
        ref={wrapperRef}
        className={`custom-select-container ${isOpen ? "is-open" : ""} ${
          isDisabled ? "is-disabled" : ""
        }`}
        onClick={handleContainerClick}
        onKeyDown={!isSearchable ? handleKeyDown : undefined}
        tabIndex={!isDisabled && !isSearchable ? 0 : undefined}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={isDisabled}
      >
        <div ref={containerRef} className="custom-select-control">
          {multiple && selectedOptions.length > 0 && (
            <div className="custom-select-tags">
              {selectedOptions.slice(0, 2).map((option) => (
                <span
                  key={getOptionValue(option)}
                  className="custom-select-tag"
                >
                  {getOptionLabel(option)}
                  <button
                    type="button"
                    className="custom-select-tag__remove"
                    onClick={(e) =>
                      handleRemoveSelected(getOptionValue(option), e)
                    }
                  >
                    <i className="ri-close-line" />
                  </button>
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <span className="custom-select-tag custom-select-tag--count">
                  +{selectedOptions.length - 2}
                </span>
              )}
            </div>
          )}
          {(!multiple || selectedOptions.length === 0) && (
            <span
              className={`custom-select-value ${
                !value || (Array.isArray(value) && value.length === 0)
                  ? "is-placeholder"
                  : ""
              }`}
            >
              {displayText}
            </span>
          )}
          {isSearchable && isOpen && (
            <input
              ref={inputRef}
              type="text"
              className="custom-select-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              onClick={(e) => e.stopPropagation()}
              aria-label="Search options"
              aria-autocomplete="list"
              aria-controls="custom-select-dropdown"
            />
          )}
          <div className="custom-select-indicator">
            <i className={`ri-arrow-down-s-line ${isOpen ? "is-open" : ""}`} />
          </div>
        </div>
      </div>

      {isOpen &&
        dropdownStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            id="custom-select-dropdown"
            className="custom-select-dropdown"
            style={dropdownStyle}
            role="listbox"
            aria-label={label || "Select options"}
          >
            {filteredOptions.length === 0 ? (
              <div className="custom-select-empty">
                <i className="ri-search-line" />
                <p>No options found</p>
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const isSelected = selectedValues.includes(optionValue);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={optionValue}
                    className={`custom-select-option ${
                      isSelected ? "is-selected" : ""
                    } ${isHighlighted ? "is-highlighted" : ""}`}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.avatar && (
                      <div className="custom-select-option__avatar-wrapper">
                        {renderAvatar(option)}
                      </div>
                    )}
                    <div className="custom-select-option__content">
                      <div className="custom-select-option__header">
                        <span className="custom-select-option__title">
                          {getOptionLabel(option)}
                        </span>
                        <div className="custom-select-option__meta">
                          {option.type && (
                            <span className="custom-select-option__type">
                              {option.type}
                            </span>
                          )}
                          {renderStatusBadge(option.status)}
                        </div>
                      </div>
                      <div className="custom-select-option__footer">
                        {option.user && (
                          <span className="custom-select-option__user">
                            <i className="ri-user-line" />
                            {option.user}
                          </span>
                        )}
                        {option.date && (
                          <span className="custom-select-option__date">
                            <i className="ri-calendar-line" />
                            {option.date}
                          </span>
                        )}
                      </div>
                      {multiple && (
                        <div className="custom-select-option__checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
