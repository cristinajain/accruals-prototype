// @ts-nocheck
"use client";

import { useRef, useState, useLayoutEffect } from "react";

type Tab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  dot?: boolean;
};

type Indicator = { left: number; width: number; top: number; height: number };

export function TabGroup({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<Indicator>({ left: 0, width: 0, top: 0, height: 0 });

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const update = () => {
      const active = group.querySelector(`[data-tab="${activeKey}"]`) as HTMLElement | null;
      if (!active) return;
      setInd({
        left:   active.offsetLeft,
        width:  active.offsetWidth,
        top:    active.offsetTop,
        height: active.offsetHeight,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeKey]);

  return (
    <div ref={groupRef} className="sp11-tab-group">
      <span
        className="sp11-tab-group__indicator"
        style={{
          width:     ind.width,
          height:    ind.height,
          top:       ind.top,
          transform: `translateX(${ind.left}px)`,
        }}
      />
      {tabs.map((t) => (
        <button
          key={t.key}
          data-tab={t.key}
          className={`sp11-tab${t.key === activeKey ? " sp11-tab--active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.icon && <span className="sp11-tab__icon">{t.icon}</span>}
          {t.label}
          {t.dot && <span className="sp11-tab__dot" />}
        </button>
      ))}
    </div>
  );
}
