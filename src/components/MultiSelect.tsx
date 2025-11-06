import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  label: string;
  id: string;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ value, onChange, options, label, id, placeholder, className }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeChip = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          toggleOption(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current) {
      const focusedElement = optionsRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const containerClassName = [
    'relative flex flex-col gap-2',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={containerClassName}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <div
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-multiselectable="true"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="group relative w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 cursor-pointer"
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(opt => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => removeChip(opt.value, e)}
                  className="rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
                  aria-label={`Remove ${opt.label}`}
                  tabIndex={-1}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">{placeholder || 'Select...'}</span>
        )}
        <svg
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div
          ref={optionsRef}
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60 dark:border-gray-700 dark:bg-gray-900"
        >
          {options.map((option, index) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleOption(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition ${
                  index === focusedIndex
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isSelected ? 'font-semibold text-primary-700 dark:text-primary-200' : 'text-gray-900 dark:text-gray-100'}`}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                  isSelected
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
