import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchData } from '@/data/searchData';
import type { SearchItem } from '@/data/searchData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter search results
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = searchData.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const descMatch = item.description.toLowerCase().includes(searchTerm);
      const keywordMatch = item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm)
      );
      return titleMatch || descMatch || keywordMatch;
    });

    setResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-20 sm:pt-32 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-dark-surface rounded-2xl border border-dark-border shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
      >
        {/* Search Input */}
        <div className="relative border-b border-dark-border">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по сайту..."
            className="w-full bg-transparent pl-12 pr-12 py-4 text-white placeholder-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-white/40 text-sm">
              Начните вводить для поиска
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <Link
                  key={`${item.url}-${index}`}
                  to={item.url}
                  onClick={onClose}
                  className="block px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Search className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/50 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-white/60 text-sm">Ничего не найдено</p>
              <p className="text-white/40 text-xs mt-1">
                Попробуйте другой запрос
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {query.trim() === '' && (
          <div className="border-t border-dark-border px-4 py-3 bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs text-white/30">
              <div className="flex items-center gap-4">
                <span>Попробуйте: баня, массаж, цены</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 font-mono">
                  ESC
                </kbd>
                <span>закрыть</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
