import type { MouseEvent, ReactNode } from 'react';

const PANEL_ID = 'menu-panel';

export type MenuState = {
  label: string;
  open: boolean;
  onToggle: () => void;
};

/** The mobile button that shows or hides the menu panel. Hidden on desktop. */
export function MenuButton({ label, open, onToggle }: MenuState) {
  return (
    <button
      className="menu-toggle"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={PANEL_ID}
    >
      {label} <span aria-hidden="true">{open ? '▴' : '▾'}</span>
    </button>
  );
}

export type PanelProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * On mobile, the menu is only shown while open and closes again once an item in it is
 * picked. On desktop, it is always shown.
 */
export function MenuPanel({ open, onClose, children }: PanelProps) {
  const closeOnSelect = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) onClose();
  };

  return (
    <div id={PANEL_ID} className={`menu${open ? ' open' : ''}`} onClick={closeOnSelect}>
      {children}
    </div>
  );
}
