import * as React from "react";
import { cn } from "../../lib/utils";

function Tooltip({ content, children, className }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-200 shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
