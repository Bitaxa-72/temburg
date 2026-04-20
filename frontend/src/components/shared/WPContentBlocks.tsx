/**
 * WPContentBlocks — рендер ACF-блоков из WP-админки.
 *
 * Используется в страницах фронта чтобы заменить хардкод-тексты на
 * редактируемые из WP-админки блоки. Если из WP ничего не пришло —
 * вызывающая страница рендерит свой fallback.
 *
 * Пример использования (в AboutPage и т.п.):
 *
 *   import { usePageContent } from '@/hooks/useWordPressData';
 *   import WPContentBlocks from '@/components/shared/WPContentBlocks';
 *
 *   const { data: pageContent } = usePageContent('about');
 *
 *   {pageContent.blocks.length > 0 ? (
 *     <WPContentBlocks blocks={pageContent.blocks} />
 *   ) : (
 *     <FallbackHardcodedContent />
 *   )}
 */

import type { WPPageContentBlock } from '@/api/wordpress';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

interface WPContentBlocksProps {
  blocks: WPPageContentBlock[];
  className?: string;
}

export default function WPContentBlocks({ blocks, className = '' }: WPContentBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return (
              <Section key={idx} className="py-6">
                <Container>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary text-center">
                    {block.heading}
                  </h2>
                </Container>
              </Section>
            );

          case 'text':
            return (
              <Section key={idx} className="py-6">
                <Container>
                  <div className="prose prose-lg mx-auto max-w-3xl text-text-secondary">
                    {block.heading && (
                      <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-4">
                        {block.heading}
                      </h2>
                    )}
                    {block.body && (
                      <div
                        // ACF wysiwyg возвращает HTML — рендерим как есть
                        dangerouslySetInnerHTML={{ __html: block.body }}
                      />
                    )}
                  </div>
                </Container>
              </Section>
            );

          case 'image':
            return (
              <Section key={idx} className="py-6">
                <Container>
                  {block.image && (
                    <img
                      src={block.image}
                      alt={block.heading || ''}
                      className="mx-auto max-w-full rounded-2xl shadow-lg"
                      loading="lazy"
                    />
                  )}
                </Container>
              </Section>
            );

          case 'list':
            return (
              <Section key={idx} className="py-6" warm>
                <Container>
                  <div className="mx-auto max-w-3xl">
                    {block.heading && (
                      <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-4 text-center">
                        {block.heading}
                      </h2>
                    )}
                    <ul className="space-y-2">
                      {(block.items || []).map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-xl bg-surface p-4 border border-border/50"
                        >
                          <span className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span className="text-text-primary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Container>
              </Section>
            );

          case 'note':
            return (
              <Section key={idx} className="py-6">
                <Container>
                  <div className="mx-auto max-w-3xl rounded-2xl border border-warm-gold/30 bg-warm-gold/10 p-6 text-text-primary">
                    {block.body}
                  </div>
                </Container>
              </Section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
