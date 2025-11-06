import { useState, useRef, type KeyboardEvent } from 'react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  label: string;
  id: string;
  className?: string;
}

export function KeywordInput({ keywords, onChange, label, id, className }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newKeyword = inputValue.trim();
      if (!keywords.includes(newKeyword)) {
        onChange([...keywords, newKeyword]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (keyword: string) => {
    onChange(keywords.filter(k => k !== keyword));
  };

  const containerClassName = [
    'flex flex-col gap-2',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <div className="flex min-h-[2.75rem] w-full flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1 dark:border-gray-600 dark:bg-gray-900">
        <div className="flex flex-wrap gap-1 items-center">
          {keywords.map(keyword => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
                aria-label={`Remove ${keyword}`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            id={id}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={keywords.length === 0 ? 'Type and press Enter' : ''}
            className="flex-1 min-w-[150px] bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Press Enter to add keywords</p>
    </div>
  );
}
