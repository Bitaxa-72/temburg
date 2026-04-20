import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function NotFoundPage() {
  return (
    <PageLayout title="404 — Страница не найдена">
      <section className="section-padding min-h-[60vh] flex items-center">
        <Container className="text-center">
          <Droplets className="w-16 h-16 text-primary/30 mx-auto mb-6" />
          <h1 className="font-heading text-7xl md:text-9xl font-bold text-primary">
            404
          </h1>
          <p className="mt-4 text-2xl font-heading font-semibold text-text-primary">
            Страница не найдена
          </p>
          <p className="mt-3 text-lg text-text-secondary max-w-md mx-auto">
            Похоже, вы заблудились в наших термах. Давайте вернёмся на главную!
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button variant="primary" size="lg">
                На главную
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
