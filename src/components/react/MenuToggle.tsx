import { useState, type ReactNode } from 'react';

export type Props = {
  label: string;
  children: ReactNode;
};

/** On mobile, hides its children behind a toggle button. On desktop, the button is hidden. */
export function MenuToggle({ label, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`menu${open ? ' open' : ''}`}>
      <button className="menu-toggle" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span> {open ? `Hide ${label}` : `Show ${label}`}
      </button>
      {children}
    </div>
  );
}
