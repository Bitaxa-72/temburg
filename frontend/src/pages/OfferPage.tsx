import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

export default function OfferPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «offer» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('offer');
  const hasPageBlocks = (pageContent?.blocks?.length || 0) > 0;
  const pageTitle = pageContent?.title || 'Публичная оферта';
  const pageDescription = pageContent?.metaDescription || 'Публичная оферта на оказание услуг термального комплекса Термбург. Условия посещения, порядок оплаты, права и обязанности сторон.';

  return (
    <PageLayout
      title={pageTitle}
      description={pageDescription}
    >
      <PageHero
        title={pageTitle}
        subtitle="Договор на оказание услуг термального комплекса"
        backgroundImage="/images/heroes/offer.webp"
      />
      {hasPageBlocks ? (
        <WPContentBlocks blocks={pageContent.blocks} />
      ) : (
        <Section>
        <div className="max-w-4xl mx-auto">
          <p className="text-text-secondary leading-relaxed mb-6 text-center italic">
            Редакция от 01.01.2024 г.
          </p>

          <p className="text-text-secondary leading-relaxed mb-8">
            Общество с ограниченной ответственностью «ТЕРМБУРГ» (ИНН 9723159498, ОГРН 1237700686002),
            именуемое в дальнейшем «Исполнитель», в лице генерального директора, действующего на
            основании Устава, публикует настоящую публичную оферту (далее — Оферта) в соответствии
            со ст. 435, ст. 437 Гражданского кодекса Российской Федерации, адресованную
            неопределённому кругу лиц (далее — Заказчик), о нижеследующем:
          </p>

          {/* 1. Общие положения */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              1. Общие положения
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.1. Настоящая Оферта является официальным предложением Исполнителя, адресованным
              любому физическому лицу (Заказчику), заключить договор на оказание услуг термального
              комплекса на условиях, определённых в настоящей Оферте.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.2. В настоящей Оферте используются следующие термины и определения:
            </p>
            <ul className="list-none space-y-2 ml-6 mb-3">
              <li className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Исполнитель</span> — ООО «ТЕРМБУРГ»,
                юридическое лицо, оказывающее услуги термального комплекса.
              </li>
              <li className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Заказчик</span> — любое дееспособное
                физическое лицо, принявшее условия настоящей Оферты и оплатившее услуги Исполнителя.
              </li>
              <li className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Оферта</span> — настоящий документ,
                опубликованный на сайте{' '}
                <a href="https://termburg.ru" className="text-primary hover:underline">
                  termburg.ru
                </a>.
              </li>
              <li className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Акцепт</span> — полное и
                безоговорочное принятие условий Оферты путём совершения действий, указанных в п. 2.3
                настоящей Оферты.
              </li>
              <li className="text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Услуги</span> — услуги термального
                комплекса, включая посещение термальных зон, бань, бассейна, SPA-процедуры и иные
                услуги, предоставляемые Исполнителем в соответствии с действующим прайс-листом.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.3. Оферта вступает в силу с момента её размещения на сайте Исполнителя и действует
              до момента её отзыва Исполнителем.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              1.4. Исполнитель вправе вносить изменения в условия Оферты без предварительного
              уведомления Заказчика. Новая редакция Оферты вступает в силу с момента её размещения
              на сайте Исполнителя, если иное не предусмотрено новой редакцией.
            </p>
          </div>

          {/* 2. Предмет оферты */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              2. Предмет оферты
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              2.1. Исполнитель обязуется оказать Заказчику услуги термального комплекса «Термбург»,
              расположенного по адресу: г. Москва, ул. Гурьянова, д. 30, 2 этаж, а Заказчик
              обязуется оплатить эти услуги в порядке и на условиях, предусмотренных настоящей
              Офертой.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              2.2. Перечень и характеристики оказываемых услуг определяются действующим
              прайс-листом Исполнителя, размещённым на сайте{' '}
              <a href="https://termburg.ru" className="text-primary hover:underline">
                termburg.ru
              </a>{' '}
              и на рецепции термального комплекса.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              2.3. Акцептом настоящей Оферты является совершение Заказчиком одного из следующих
              действий:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                оплата услуг Исполнителя любым доступным способом;
              </li>
              <li className="text-text-secondary leading-relaxed">
                приобретение билета (абонемента, сертификата) на посещение термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                фактическое посещение термального комплекса и использование его услуг.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              2.4. Акцепт Оферты означает, что Заказчик ознакомлен и согласен со всеми условиями
              настоящей Оферты, Правилами посещения термального комплекса и действующим прайс-листом.
            </p>
          </div>

          {/* 3. Стоимость услуг и порядок оплаты */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              3. Стоимость услуг и порядок оплаты
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.1. Стоимость услуг определяется в соответствии с действующим прайс-листом
              Исполнителя, размещённым на сайте{' '}
              <a href="https://termburg.ru" className="text-primary hover:underline">
                termburg.ru
              </a>{' '}
              и на рецепции термального комплекса. Цены указаны в российских рублях и включают
              НДС в случаях, предусмотренных действующим законодательством.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.2. Исполнитель вправе в одностороннем порядке изменять стоимость услуг. Изменение
              стоимости не распространяется на уже оплаченные услуги.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.3. Оплата услуг производится Заказчиком одним из следующих способов:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                наличными денежными средствами на рецепции термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                банковскими картами (Visa, MasterCard, МИР) на рецепции термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                онлайн-оплатой через сайт Исполнителя с использованием банковских карт или
                электронных платёжных систем;
              </li>
              <li className="text-text-secondary leading-relaxed">
                иными способами, предусмотренными Исполнителем.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.4. Оплата услуг производится до начала их оказания, если иное не предусмотрено
              отдельным соглашением сторон или специальными предложениями Исполнителя.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              3.5. Подтверждением оплаты является кассовый чек (электронный или бумажный), выданный
              Заказчику в соответствии с требованиями законодательства Российской Федерации.
            </p>
          </div>

          {/* 4. Порядок оказания услуг */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              4. Порядок оказания услуг
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.1. Услуги оказываются в соответствии с режимом работы термального комплекса,
              установленным Исполнителем. Актуальный режим работы публикуется на сайте{' '}
              <a href="https://termburg.ru" className="text-primary hover:underline">
                termburg.ru
              </a>{' '}
              и размещается на рецепции.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.2. Заказчик обязуется соблюдать Правила посещения термального комплекса, которые
              являются неотъемлемой частью настоящей Оферты и размещены на сайте Исполнителя и на
              информационных стендах комплекса.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.3. Исполнитель вправе отказать в оказании услуг лицам:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                находящимся в состоянии алкогольного или наркотического опьянения;
              </li>
              <li className="text-text-secondary leading-relaxed">
                имеющим видимые признаки кожных, инфекционных или иных заболеваний, представляющих
                угрозу для здоровья других посетителей;
              </li>
              <li className="text-text-secondary leading-relaxed">
                нарушающим Правила посещения термального комплекса и общественный порядок.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.4. Посещение термального комплекса имеет медицинские противопоказания, в том числе
              (но не ограничиваясь): острые воспалительные заболевания, онкологические заболевания,
              заболевания сердечно-сосудистой системы в стадии декомпенсации, эпилепсия,
              беременность, открытые раны и повреждения кожного покрова. Заказчик самостоятельно
              несёт ответственность за состояние своего здоровья и наличие противопоказаний к
              посещению термального комплекса. Рекомендуется предварительная консультация с лечащим
              врачом.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.5. Дети в возрасте до 14 лет допускаются на территорию термального комплекса только
              в сопровождении родителей (законных представителей). Дети в возрасте до 6 лет
              допускаются бесплатно. Для детей от 6 до 12 лет действует специальный тариф.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              4.6. Исполнитель вправе ограничить количество одновременно находящихся на территории
              комплекса посетителей в целях обеспечения комфорта и безопасности.
            </p>
          </div>

          {/* 5. Права и обязанности сторон */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              5. Права и обязанности сторон
            </h3>

            <p className="text-text-primary font-medium mb-3 mt-4">
              5.1. Исполнитель обязуется:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                оказывать услуги надлежащего качества в соответствии с действующим
                законодательством Российской Федерации и настоящей Офертой;
              </li>
              <li className="text-text-secondary leading-relaxed">
                обеспечивать санитарно-гигиенические нормы на территории термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                информировать Заказчика об условиях оказания услуг, их стоимости и правилах
                посещения;
              </li>
              <li className="text-text-secondary leading-relaxed">
                обеспечивать безопасность Заказчика при условии соблюдения им Правил посещения
                термального комплекса.
              </li>
            </ul>

            <p className="text-text-primary font-medium mb-3 mt-4">
              5.2. Исполнитель вправе:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                вносить изменения в перечень и стоимость предоставляемых услуг;
              </li>
              <li className="text-text-secondary leading-relaxed">
                устанавливать и изменять режим работы термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                приостанавливать или прекращать оказание услуг в случае проведения технических,
                ремонтных или профилактических работ;
              </li>
              <li className="text-text-secondary leading-relaxed">
                отказать в обслуживании или удалить Заказчика с территории комплекса в случае
                нарушения им Правил посещения, без возврата стоимости услуг.
              </li>
            </ul>

            <p className="text-text-primary font-medium mb-3 mt-4">
              5.3. Заказчик обязуется:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                своевременно оплачивать услуги Исполнителя;
              </li>
              <li className="text-text-secondary leading-relaxed">
                соблюдать Правила посещения термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                бережно относиться к имуществу Исполнителя;
              </li>
              <li className="text-text-secondary leading-relaxed">
                уважительно относиться к другим посетителям и персоналу термального комплекса;
              </li>
              <li className="text-text-secondary leading-relaxed">
                самостоятельно оценивать состояние своего здоровья и наличие противопоказаний;
              </li>
              <li className="text-text-secondary leading-relaxed">
                незамедлительно сообщать персоналу об ухудшении самочувствия, получении травм или
                обнаружении неисправностей оборудования.
              </li>
            </ul>

            <p className="text-text-primary font-medium mb-3 mt-4">
              5.4. Заказчик вправе:
            </p>
            <ul className="list-disc ml-10 space-y-1 mb-3">
              <li className="text-text-secondary leading-relaxed">
                получать полную и достоверную информацию об услугах Исполнителя;
              </li>
              <li className="text-text-secondary leading-relaxed">
                пользоваться услугами термального комплекса в соответствии с оплаченным тарифом;
              </li>
              <li className="text-text-secondary leading-relaxed">
                обращаться к Исполнителю с претензиями по качеству оказанных услуг в порядке,
                предусмотренном настоящей Офертой.
              </li>
            </ul>
          </div>

          {/* 6. Ответственность сторон */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              6. Ответственность сторон
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.1. За неисполнение или ненадлежащее исполнение обязательств по настоящей Оферте
              стороны несут ответственность в соответствии с действующим законодательством Российской
              Федерации.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.2. Исполнитель не несёт ответственности за вред, причинённый здоровью Заказчика,
              если он возник вследствие нарушения Заказчиком Правил посещения, несоблюдения
              медицинских противопоказаний или по иным причинам, не зависящим от Исполнителя.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.3. Исполнитель не несёт ответственности за сохранность личных вещей Заказчика,
              оставленных без присмотра на территории термального комплекса, за исключением вещей,
              сданных на хранение в установленном порядке (индивидуальные шкафчики).
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.4. Заказчик несёт материальную ответственность за ущерб, причинённый имуществу
              Исполнителя по вине Заказчика, и обязуется возместить стоимость повреждённого имущества
              в полном объёме.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              6.5. Стороны освобождаются от ответственности за неисполнение или ненадлежащее
              исполнение обязательств по настоящей Оферте, если такое неисполнение явилось
              следствием обстоятельств непреодолимой силы (форс-мажор), включая, но не ограничиваясь:
              стихийные бедствия, пожары, аварии, эпидемии, действия и решения органов
              государственной власти.
            </p>
          </div>

          {/* 7. Порядок разрешения споров */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              7. Порядок разрешения споров
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              7.1. Все споры и разногласия, возникающие между сторонами в связи с исполнением
              настоящей Оферты, разрешаются путём переговоров.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              7.2. В случае невозможности разрешения споров путём переговоров стороны применяют
              обязательный претензионный порядок. Претензия направляется в письменной форме по
              адресу Исполнителя или на электронную почту{' '}
              <a href="mailto:info@termburg.ru" className="text-primary hover:underline">
                info@termburg.ru
              </a>
              . Срок рассмотрения претензии составляет 30 (тридцать) календарных дней с момента
              её получения.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              7.3. При невозможности урегулирования спора в претензионном порядке спор подлежит
              рассмотрению в суде по месту нахождения Исполнителя в соответствии с действующим
              законодательством Российской Федерации.
            </p>
          </div>

          {/* 8. Прочие условия */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              8. Прочие условия
            </h3>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.1. Настоящая Оферта регулируется и толкуется в соответствии с законодательством
              Российской Федерации.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.2. Признание какого-либо положения настоящей Оферты недействительным или не
              подлежащим принудительному исполнению не влечёт недействительности остальных положений.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.3. Заказчик, принимая условия настоящей Оферты, даёт своё согласие на обработку
              персональных данных в соответствии с Федеральным законом от 27.07.2006 N 152-ФЗ
              «О персональных данных» в целях исполнения обязательств по настоящей Оферте.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.4. Все уведомления и сообщения в рамках настоящей Оферты могут направляться
              сторонами друг другу по электронной почте, посредством размещения информации на сайте
              Исполнителя, а также иными способами, позволяющими достоверно установить отправителя.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              8.5. Бездействие со стороны Исполнителя в случае нарушения Заказчиком условий Оферты
              не лишает Исполнителя права предпринять соответствующие действия в дальнейшем и не
              означает отказ Исполнителя от своих прав в случае повторных аналогичных нарушений.
            </p>
          </div>

          {/* 9. Реквизиты Исполнителя */}
          <div className="mb-10">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              9. Реквизиты Исполнителя
            </h3>
            <div className="rounded-2xl bg-surface border border-border/50 p-6 md:p-8">
              <p className="text-text-primary font-bold text-lg mb-4">
                ООО «ТЕРМБУРГ»
              </p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <span className="text-text-secondary text-sm">ИНН</span>
                  <p className="text-text-primary">9723159498</p>
                </div>
                <div>
                  <span className="text-text-secondary text-sm">ОГРН</span>
                  <p className="text-text-primary">1237700686002</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary text-sm">Юридический адрес</span>
                  <p className="text-text-primary">г. Москва, ул. Гурьянова, д. 30, 2 этаж</p>
                </div>
                <div>
                  <span className="text-text-secondary text-sm">Телефон</span>
                  <p className="text-text-primary">
                    <a
                      href="tel:+79091674746"
                      className="hover:text-primary transition-colors"
                    >
                      +7 (909) 167-47-46
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary text-sm">Электронная почта</span>
                  <p className="text-text-primary">
                    <a
                      href="mailto:info@termburg.ru"
                      className="text-primary hover:underline"
                    >
                      info@termburg.ru
                    </a>
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary text-sm">Сайт</span>
                  <p className="text-text-primary">
                    <a
                      href="https://termburg.ru"
                      className="text-primary hover:underline"
                    >
                      termburg.ru
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Section>
      )}
    </PageLayout>
  );
}
