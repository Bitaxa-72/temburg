import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={twMerge(
        clsx('flex gap-1 border-b border-border', className),
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-5 py-3 text-sm font-medium transition-colors duration-200 relative cursor-pointer',
              'hover:text-primary',
              isActive
                ? 'text-primary'
                : 'text-text-secondary',
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
