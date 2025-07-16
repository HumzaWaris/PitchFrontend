import React, { useState, useRef } from 'react';

const options = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`);

export default function SimpleDropdownTest() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-64 mx-auto mt-10">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        {/* Textbook SVG icon */}
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-cyan-400">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
          <path d="M8 4v16" strokeWidth="2" />
          <path d="M16 4v16" strokeWidth="2" />
          <path d="M4 8h16" strokeWidth="2" />
        </svg>
      </span>
      <input
        ref={inputRef}
        className="w-full border border-gray-300 rounded-md px-10 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 text-sm h-10"
        value={selected}
        onFocus={() => setOpen(true)}
        onChange={e => setSelected(e.target.value)}
        placeholder="Select option"
        readOnly
      />
      {open && (
        <div
          className="z-50 bg-white border border-cyan-200 shadow-2xl rounded-xl max-h-48 overflow-y-auto absolute left-0 top-full w-full mt-1"
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          {options.map(option => (
            <div
              key={option}
              className="px-3 py-2 cursor-pointer text-sm hover:bg-cyan-50"
              onMouseDown={() => { setSelected(option); setOpen(false); }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onMouseDown={() => setOpen(false)}
          onPointerDown={() => setOpen(false)}
        />
      )}
    </div>
  );
} 