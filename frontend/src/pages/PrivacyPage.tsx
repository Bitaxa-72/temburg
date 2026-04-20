import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

export default function PrivacyPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «privacy» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('privacy');

  return (
    <PageLayout
      title="Политика конфиденциальности"
      description="Политика конфиденциальности термального комплекса Термбург. Обработка и защита персональных данных в соответствии с 152-ФЗ."
    >
      <PageHero
        title="Политика конфиденциальности"
        subtitle="Обработка и защита персональных данных"
        backgroundImage="/images/heroes/privacy.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      <Section>
        <div className="max-w-4xl mx-auto">
          <p className="text-text-secondary leading-relaxed mb-8">
            Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки
            и защиты персональных данных пользователей (далее — «Пользователь») сайта termburg.ru
            (далее — «Сайт»), принадлежащего ООО&nbsp;«ТЕРМБУРГ» (далее — «Оператор»).
          </p>
          <p className="text-text-secondary leading-relaxed mb-8">
            Дата последнего обновления: 1 января 2025&nbsp;г.
          </p>

          {/* 1. Общие положения */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              1. Общие положения
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.1. Оператором персональных данных является ООО&nbsp;«ТЕРМБУРГ»
              (ИНН&nbsp;9723159498, ОГРН&nbsp;1237700686002), зарегистрированное по адресу:
              г.&nbsp;Москва, ул.&nbsp;Гурьянова, д.&nbsp;30, 2&nbsp;этаж.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.2. Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006
              №&nbsp;152-ФЗ «О персональных данных» и иными нормативными правовыми актами
              Российской Федерации в области защиты персональных данных.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.3. Политика действует в отношении всех персональных данных, которые Оператор может
              получить от Пользователя при использовании Сайта, оформлении бронирования, покупке
              услуг, а также в ходе исполнения любых договоров и соглашений.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.4. Использование Сайта означает безоговорочное согласие Пользователя с настоящей
              Политикой и указанными в ней условиями обработки персональных данных. В случае
              несогласия с условиями Политики Пользователь должен воздержаться от использования
              Сайта.
            </p>
          </div>

          {/* 2. Цели обработки персональных данных */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              2. Цели обработки персональных данных
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              2.1. Оператор обрабатывает персональные данные Пользователя в следующих целях:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                бронирование посещений термального комплекса и отдельных процедур;
              </li>
              <li>
                оказание услуг термального комплекса, включая банные, SPA- и оздоровительные
                процедуры;
              </li>
              <li>
                оформление и исполнение договоров на оказание услуг;
              </li>
              <li>
                обработка платежей и возвратов денежных средств;
              </li>
              <li>
                направление информационных и рекламных рассылок (при наличии согласия Пользователя);
              </li>
              <li>
                информирование об акциях, специальных предложениях и мероприятиях;
              </li>
              <li>
                улучшение качества обслуживания и работы Сайта;
              </li>
              <li>
                ведение статистики и аналитики посещений Сайта;
              </li>
              <li>
                обратная связь с Пользователем, обработка обращений и запросов;
              </li>
              <li>
                исполнение требований законодательства Российской Федерации.
              </li>
            </ul>
          </div>

          {/* 3. Правовые основания обработки */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              3. Правовые основания обработки
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.1. Обработка персональных данных осуществляется на следующих правовых основаниях:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                согласие субъекта персональных данных на обработку его персональных данных
                (ст.&nbsp;6, п.&nbsp;1, пп.&nbsp;1 Федерального закона №&nbsp;152-ФЗ);
              </li>
              <li>
                исполнение договора, стороной которого является субъект персональных данных
                (ст.&nbsp;6, п.&nbsp;1, пп.&nbsp;5 Федерального закона №&nbsp;152-ФЗ);
              </li>
              <li>
                законные интересы Оператора, не нарушающие права и свободы субъекта персональных
                данных (ст.&nbsp;6, п.&nbsp;1, пп.&nbsp;7 Федерального закона №&nbsp;152-ФЗ);
              </li>
              <li>
                необходимость исполнения обязанностей, возложенных на Оператора законодательством
                Российской Федерации.
              </li>
            </ul>
          </div>

          {/* 4. Состав персональных данных */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              4. Состав персональных данных
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.1. Оператор может обрабатывать следующие персональные данные Пользователя:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>фамилия, имя, отчество;</li>
              <li>номер контактного телефона;</li>
              <li>адрес электронной почты (email);</li>
              <li>дата рождения;</li>
              <li>
                платёжные данные (обрабатываются исключительно платёжным агентом в защищённой среде);
              </li>
              <li>
                данные о посещениях Сайта (IP-адрес, информация из файлов cookie, данные браузера,
                время доступа, адреса просматриваемых страниц).
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.2. Оператор не осуществляет обработку специальных категорий персональных данных,
              касающихся расовой, национальной принадлежности, политических взглядов, религиозных или
              философских убеждений, состояния здоровья, интимной жизни.
            </p>
          </div>

          {/* 5. Порядок обработки персональных данных */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              5. Порядок обработки персональных данных
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              5.1. Обработка персональных данных включает следующие действия: сбор, запись,
              систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение,
              использование, передачу (предоставление, доступ), обезличивание, блокирование,
              удаление, уничтожение.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              5.2. Сбор персональных данных осуществляется при заполнении Пользователем форм на Сайте
              (бронирование, обратная связь, регистрация), а также автоматически при посещении Сайта
              (cookie, данные браузера).
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              5.3. Оператор обрабатывает персональные данные как с использованием средств
              автоматизации, так и без их использования.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              5.4. Персональные данные уничтожаются Оператором по достижении целей обработки, по
              истечении срока хранения, при отзыве согласия субъектом персональных данных, а также при
              выявлении неправомерной обработки.
            </p>
          </div>

          {/* 6. Хранение и защита данных */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              6. Хранение и защита данных
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.1. Персональные данные Пользователей хранятся на территории Российской Федерации в
              соответствии с требованиями законодательства.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.2. Срок хранения персональных данных определяется достижением целей обработки, сроком
              действия согласия Пользователя либо сроками, установленными законодательством
              Российской Федерации. По истечении указанных сроков персональные данные подлежат
              уничтожению.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.3. Оператор принимает необходимые и достаточные организационные и технические меры
              для защиты персональных данных от неправомерного или случайного доступа, уничтожения,
              изменения, блокирования, копирования, распространения, а также от иных неправомерных
              действий третьих лиц. В&nbsp;частности:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                использование шифрования данных при передаче по сети (SSL/TLS);
              </li>
              <li>
                ограничение доступа сотрудников к персональным данным;
              </li>
              <li>
                регулярное обновление программного обеспечения и средств защиты;
              </li>
              <li>
                проведение аудита систем обработки персональных данных;
              </li>
              <li>
                резервное копирование данных.
              </li>
            </ul>
          </div>

          {/* 7. Права субъекта персональных данных */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              7. Права субъекта персональных данных
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              7.1. Пользователь имеет право:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                получать информацию, касающуюся обработки его персональных данных, в том числе
                содержащую: подтверждение факта обработки, правовые основания и цели обработки, способы
                обработки, наименование и местонахождение Оператора;
              </li>
              <li>
                требовать уточнения своих персональных данных, их блокирования или уничтожения, если
                данные являются неполными, устаревшими, неточными, незаконно полученными или не
                являются необходимыми для заявленной цели обработки;
              </li>
              <li>
                отозвать согласие на обработку персональных данных, направив соответствующее
                уведомление Оператору;
              </li>
              <li>
                требовать удаления персональных данных;
              </li>
              <li>
                обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав
                субъектов персональных данных (Роскомнадзор) или в судебном порядке.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              7.2. Для реализации своих прав Пользователь может направить запрос на электронную почту:{' '}
              <a href="mailto:info@termburg.ru" className="text-primary hover:underline">
                info@termburg.ru
              </a>{' '}
              или по почтовому адресу Оператора. Запрос должен содержать ФИО, контактные данные и
              описание требования. Срок рассмотрения запроса — 30 календарных дней с момента
              получения.
            </p>
          </div>

          {/* 8. Использование файлов cookie */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              8. Использование файлов cookie
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.1. Сайт использует файлы cookie для обеспечения корректной работы, персонализации
              контента и анализа трафика. Файлы cookie — это небольшие текстовые файлы, которые
              сохраняются на устройстве Пользователя при посещении Сайта.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.2. На Сайте используются следующие типы файлов cookie:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                <span className="text-text-primary font-medium">Необходимые</span> — обеспечивают
                базовую функциональность Сайта (авторизация, безопасность, корзина);
              </li>
              <li>
                <span className="text-text-primary font-medium">Функциональные</span> — сохраняют
                предпочтения Пользователя (язык, регион, настройки отображения);
              </li>
              <li>
                <span className="text-text-primary font-medium">Аналитические</span> — позволяют
                анализировать посещаемость и поведение Пользователей на Сайте для улучшения его
                работы;
              </li>
              <li>
                <span className="text-text-primary font-medium">Маркетинговые</span> — используются
                для показа релевантной рекламы и оценки эффективности рекламных кампаний.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.3. Пользователь может отключить использование файлов cookie в настройках своего
              браузера. При этом некоторые функции Сайта могут стать недоступными.
            </p>
          </div>

          {/* 9. Передача данных третьим лицам */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              9. Передача данных третьим лицам
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              9.1. Оператор не передаёт персональные данные третьим лицам, за исключением случаев,
              прямо предусмотренных настоящей Политикой и законодательством Российской Федерации.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              9.2. Передача персональных данных допускается в следующих случаях:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary leading-relaxed mb-3 ml-4">
              <li>
                <span className="text-text-primary font-medium">Платёжные системы</span> — для
                обработки платежей данные передаются лицензированным платёжным агентам,
                обеспечивающим безопасность транзакций в соответствии со стандартом PCI&nbsp;DSS;
              </li>
              <li>
                <span className="text-text-primary font-medium">Хостинг-провайдер</span> — для
                обеспечения функционирования Сайта данные могут размещаться на серверах
                хостинг-провайдера, осуществляющего обработку данных на основании договора с
                Оператором;
              </li>
              <li>
                <span className="text-text-primary font-medium">Сервисы аналитики</span> —
                обезличенные данные о посещении Сайта могут передаваться сторонним сервисам
                веб-аналитики (Яндекс.Метрика, Google Analytics) для анализа трафика и улучшения
                работы Сайта;
              </li>
              <li>
                <span className="text-text-primary font-medium">Государственные органы</span> — по
                запросу уполномоченных государственных органов в случаях, предусмотренных
                законодательством Российской Федерации.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              9.3. Во всех случаях передачи персональных данных Оператор обеспечивает соблюдение
              требований законодательства о персональных данных и заключает с третьими лицами
              соответствующие соглашения о конфиденциальности.
            </p>
          </div>

          {/* 10. Изменения в Политике */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              10. Изменения в Политике
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              10.1. Оператор вправе вносить изменения в настоящую Политику конфиденциальности.
              Новая редакция Политики вступает в силу с момента её размещения на Сайте, если иное
              не предусмотрено новой редакцией.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              10.2. Действующая редакция Политики всегда доступна на странице Сайта по адресу:{' '}
              <a href="/privacy" className="text-primary hover:underline">
                termburg.ru/privacy
              </a>
              .
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              10.3. Продолжение использования Сайта после внесения изменений в Политику означает
              согласие Пользователя с новой редакцией.
            </p>
          </div>

          {/* 11. Контактная информация */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              11. Контактная информация
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              По всем вопросам, связанным с обработкой персональных данных, Пользователь может
              обратиться к Оператору:
            </p>
            <div className="bg-surface rounded-xl border border-border p-6 space-y-3">
              <p className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Наименование:</span>{' '}
                ООО&nbsp;«ТЕРМБУРГ»
              </p>
              <p className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">ИНН:</span> 9723159498
              </p>
              <p className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">ОГРН:</span> 1237700686002
              </p>
              <p className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Адрес:</span> г.&nbsp;Москва,
                ул.&nbsp;Гурьянова, д.&nbsp;30, 2&nbsp;этаж
              </p>
              <p className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Email:</span>{' '}
                <a href="mailto:info@termburg.ru" className="text-primary hover:underline">
                  info@termburg.ru
                </a>
              </p>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
