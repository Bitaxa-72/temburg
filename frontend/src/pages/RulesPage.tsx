import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  Clock,
  DoorOpen,
  Droplets,
  Flame,
  Sparkles,
  Waves,
  Heart,
  Ban,
  Scale,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import { rulesCategories as localRulesCategories, type RuleCategory } from '@/data/rules';
import { usePageContent, useRules } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const categoryIcons: Record<string, typeof Users> = {
  general: FileText,
  children: Users,
  bracelet: CreditCard,
  schedule: Clock,
  entry: DoorOpen,
  hygiene: Droplets,
  sauna: Flame,
  clay: Sparkles,
  pool: Waves,
  'salt-pool': Heart,
  prohibited: Ban,
  rights: Scale,
  claims: FileText,
  safety: ShieldCheck,
};

export default function RulesPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «rules» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('rules');
  const pageTitle = pageContent?.title || 'Правила комплекса';
  const pageDescription = pageContent?.metaDescription || 'Правила посещения термального комплекса Термбург: полный список требований безопасности, условий посещения и поведения гостей.';

  const { data: wpRules } = useRules();
  const rulesCategories: RuleCategory[] = (wpRules.length ? wpRules : localRulesCategories).map((category) => ({
    ...category,
    id: String(category.id),
    rules: category.rules || [],
  }));
  const totalRulesCount = useMemo(() => {
    return rulesCategories.reduce((sum, c) => sum + (c.rules?.length || 0), 0);
  }, [rulesCategories]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedCategories((prev) => {
      const ids = new Set(rulesCategories.map((category) => category.id));
      if (prev.size > 0 && Array.from(prev).some((id) => ids.has(id))) return prev;
      if (rulesCategories.length === 0) return prev;
      return new Set([rulesCategories[0].id]);
    });
  }, [rulesCategories]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(rulesCategories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  let ruleNumber = 0;

  return (
    <PageLayout title={pageTitle} description={pageDescription}>
      <PageHero
        title={pageTitle}
        subtitle={`${totalRulesCount} пунктов для комфортного и безопасного отдыха`}
        backgroundImage="/images/heroes/faq.webp"
      />
      {wpRules.length === 0 && pageContent?.blocks?.length > 0 ? (
        <WPContentBlocks blocks={pageContent.blocks} />
      ) : (
        <Section>
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-text-secondary">
              Всего правил: <strong className="text-primary">{totalRulesCount}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Развернуть все
              </button>
              <span className="text-text-secondary/30">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Свернуть все
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            {rulesCategories.map((category) => {
              const Icon = categoryIcons[category.id] || FileText;
              const isExpanded = expandedCategories.has(category.id);
              const startNumber = ruleNumber + 1;
              const endNumber = ruleNumber + category.rules.length;

              return (
                <div
                  key={category.id}
                  className="rounded-2xl bg-surface border border-border/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-surface-warm transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-primary">{category.title}</h3>
                      <p className="text-xs text-text-secondary">
                        Пункты {startNumber}–{endNumber} ({category.rules.length})
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-secondary" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="border-t border-border/50 pt-4 space-y-2">
                        {category.rules.map((rule, idx) => {
                          ruleNumber++;
                          const currentNumber = startNumber + idx;
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-surface-warm transition-colors"
                            >
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                {currentNumber}
                              </span>
                              <p className="text-sm text-text-primary leading-relaxed pt-1">
                                {rule}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Update rule counter for collapsed categories */}
                  {!isExpanded && (() => { ruleNumber += category.rules.length; return null; })()}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-8 p-6 rounded-2xl bg-surface-warm border border-border/50 text-center">
            <p className="text-sm text-text-secondary">
              Правила размещены на информационном стенде и на сайте{' '}
              <a href="https://termburg.ru" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                termburg.ru
              </a>
            </p>
            <p className="text-xs text-text-secondary/70 mt-2">
              © Термбург, 2023–{new Date().getFullYear()}
            </p>
          </div>
        </div>
        </Section>
      )}
    </PageLayout>
  );
}
