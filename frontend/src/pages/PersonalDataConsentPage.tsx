import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';

export default function PersonalDataConsentPage() {
  return (
    <PageLayout
      title="Согласие на обработку персональных данных"
      description="Согласие пользователя сайта termburg.ru на обработку персональных данных."
    >
      <PageHero
        title="Согласие на обработку персональных данных"
        subtitle="Порядок обработки данных пользователей сайта"
        backgroundImage="/images/heroes/privacy.webp"
      />
      <Section>
        <div className="max-w-4xl mx-auto space-y-8 text-text-secondary leading-relaxed">
          <p>
            Настоящим пользователь сайта termburg.ru свободно, своей волей и в своем интересе дает согласие ООО «ТЕРМБУРГ» на обработку персональных данных, указанных в формах сайта.
          </p>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">1. Оператор</h3>
            <p>
              Оператор персональных данных: ООО «ТЕРМБУРГ», ИНН 9723159498, ОГРН 1237700686002, адрес: г. Москва, ул. Гурьянова, д. 30, 2 этаж.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">2. Персональные данные</h3>
            <p>
              Согласие распространяется на имя, телефон, адрес электронной почты, сведения о выбранных услугах, дату и время посещения, текст сообщения, а также технические данные, необходимые для работы сайта.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">3. Цели обработки</h3>
            <p>
              Данные обрабатываются для приема и обработки заявок, оформления бронирований и заказов, связи с пользователем, исполнения договоров, направления сервисных уведомлений и выполнения требований законодательства.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">4. Действия с данными</h3>
            <p>
              Оператор вправе осуществлять сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу в случаях, предусмотренных законом, обезличивание, блокирование, удаление и уничтожение персональных данных.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">5. Срок действия и отзыв</h3>
            <p>
              Согласие действует до достижения целей обработки или до его отзыва. Пользователь может отозвать согласие, направив обращение на адрес электронной почты{' '}
              <a className="text-primary hover:underline" href="mailto:info@termburg.ru">info@termburg.ru</a>.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">6. Политика обработки данных</h3>
            <p>
              Подробные условия обработки и защиты персональных данных размещены в{' '}
              <a className="text-primary hover:underline" href="/privacy">политике обработки персональных данных</a>.
            </p>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
