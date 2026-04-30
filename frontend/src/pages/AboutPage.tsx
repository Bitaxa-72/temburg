import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ListChecks, X, AlertTriangle, Heart, Droplets, Flame, Baby, Ban, Phone, Camera, ScrollText, Star, Loader2, Sparkles, Thermometer, Crown, Leaf } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import ImageLightbox from '@/components/shared/ImageLightbox';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import WPImage from '@/components/ui/WPImage';
import type { ZoneCategory, ZoneItem } from '@/data/zoneCategories';
import { useTeamWithFallback } from '@/hooks/useDataWithFallback';
import { useAboutContent, usePageContent, useZonesData } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { mapZonesDataToCategories } from '@/utils/zonesData';

// Парсит строки вида "до 80°C · влажн. 70%" или "10–12°C" в две части
function parseTemp(raw?: string): { temp: string; humidity: string | null } {
  if (!raw) return { temp: '—', humidity: null };
  const parts = raw.split('·').map(s => s.trim());
  const tempPart = parts[0] || raw;
  const humidPart = parts[1] || null;
  return { temp: tempPart, humidity: humidPart };
}

function ClimatePill({ raw, size = 'sm' }: { raw?: string; size?: 'sm' | 'md' }) {
  const { temp, humidity } = parseTemp(raw);
  const padding = size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-[11px]';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className={`inline-flex items-stretch bg-black/65 backdrop-blur-md text-white font-semibold rounded-full border border-white/15 shadow-md overflow-hidden`}>
      <div className={`flex items-center gap-1.5 ${padding}`}>
        <Thermometer className={`${iconSize} text-primary`} />
        <span className="tabular-nums">{temp}</span>
      </div>
      {humidity && (
        <>
          <div className="w-px bg-white/15" />
          <div className={`flex items-center gap-1.5 ${padding}`}>
            <Droplets className={`${iconSize} text-sky-300`} />
            <span className="tabular-nums">{humidity}</span>
          </div>
        </>
      )}
    </div>
  );
}

function ZoneItemModal({ item, onClose }: { item: ZoneItem; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Последний элемент features часто = имя хранителя (термлин)
  const features = item.features || [];
  const guardian = features.length > 3 ? features[features.length - 1] : null;
  const highlights = guardian ? features.slice(0, -1) : features;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-surface border border-primary/20 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
        {/* Hero image */}
        <div className="h-64 sm:h-72 overflow-hidden rounded-t-3xl relative">
          <WPImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {item.temp && (
            <div className="absolute top-4 left-4">
              <ClimatePill raw={item.temp} size="md" />
            </div>
          )}

          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{item.name}</h2>
          </div>
        </div>

        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white hover:bg-black/80 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px] mb-6">{item.desc}</p>

          {highlights.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Главные особенности</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 via-primary/40 to-transparent" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((f) => (
                  <div
                    key={f}
                    className="group relative rounded-2xl bg-gradient-to-br from-primary/[0.08] via-surface to-primary/[0.04] border border-primary/15 p-5 text-center hover:border-primary/40 hover:shadow-[0_8px_30px_-10px_rgba(212,175,55,0.4)] transition-all duration-300"
                  >
                    <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center shadow-inner">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-text-primary leading-snug">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guardian && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary italic">
              <Crown className="w-3.5 h-3.5 text-primary/70" />
              Хранитель: <span className="font-medium text-text-primary not-italic">{guardian}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZoneModal({ zone, onClose }: { zone: ZoneCategory; onClose: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ZoneItem | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !selectedItem) onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [onClose, selectedItem]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-48 sm:h-56 overflow-hidden rounded-t-2xl relative">
          <WPImage src={zone.image} alt={zone.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h2 className="text-3xl font-bold text-white">{zone.name}</h2>
            <p className="text-white/80">{zone.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <p className="text-text-secondary mb-6">{zone.description}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zone.items.map((item) => {
              const feats = item.features || [];
              const hasGuardian = feats.length > 3;
              const guardianName = hasGuardian ? feats[feats.length - 1] : null;
              const chips = hasGuardian ? feats.slice(0, -1) : feats;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSelectedItem(item)}
                  className="group relative text-left rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/40 hover:shadow-[0_15px_40px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden">
                    <WPImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    {item.temp && (
                      <div className="absolute top-3 right-3">
                        <ClimatePill raw={item.temp} />
                      </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-md leading-tight line-clamp-2">{item.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-text-secondary line-clamp-3 mb-3 leading-relaxed min-h-[3.6em]">{item.desc}</p>
                    <div className="min-h-[1.5rem] flex flex-wrap gap-1.5">
                      {chips.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3 text-[11px] font-semibold text-primary/80 group-hover:text-primary transition-colors">
                      Подробнее →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedItem && <ZoneItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

const visitRules = [
  'Вход с 9:00, последний вход в 22:00',
  'Дети до 6 лет включительно — детский тариф',
  'Необходимо иметь купальный костюм и сменную обувь',
  'В термальных зонах обязательно использование полотенца',
  'Максимальное время нахождения в горячих зонах — 15 минут',
  'Запрещено посещение в состоянии алкогольного опьянения',
  'Запрещено приносить свою еду и напитки',
];

/* ─── Full Rules Modal - All 137 points ─── */
const fullRulesData = {
  general: {
    title: 'Общие положения',
    items: [
      '1. Комплекс открыт для оказания физкультурно-оздоровительных услуг',
      '2. Посетитель должен ознакомиться с правилами перед оплатой',
      '3. Посетитель подтверждает подписью ознакомление с правилами',
      '4. Подтверждением служит расписка, чек или электронный браслет',
    ],
  },
  children: {
    title: 'Условия для детей',
    items: [
      '5. Комплекс не несёт ответственность за детей без присмотра',
      '6. Родители несут персональную ответственность за детей до 18 лет',
      '7. Родители обязаны находиться на территории во время посещения детьми',
      '8. Дети должны соблюдать правила',
      '9. Родители несут материальную ответственность за ущерб имуществу',
    ],
  },
  services: {
    title: 'Основные и дополнительные услуги',
    items: [
      '10. Входной билет — электронный браслет',
      '11. Браслет носится на запястье и не передаётся другим лицам',
      '12. Посетитель обязан визуально осмотреть браслет при получении',
      '13. Об утрате/повреждении браслета нужно сообщить администрации',
      '14. За утрату/повреждение браслета взимается 2000 рублей',
      '15. За утрату номерка гардероба — 500 рублей',
      '16. Количество одновременно находящихся посетителей ограничено',
      '17. Режим и стоимость размещены у входа и на сайте',
      '18. Посетитель самостоятельно контролирует время пребывания',
      '19. Вход прекращается за 1 час до закрытия',
      '20. Ведётся видеонаблюдение в допустимых для этого местах',
      '21. Информация размещена на информационном стенде «Уголок потребителя»',
      '22. Стоимость указана на кассах и сайте (termburg.ru)',
      '23. При льготном тарифе нужно предъявить оригиналы документов',
      '24. При покупке билета предъявить документ, удостоверяющий личность и возраст',
      '25. К дополнительным услугам относятся: питание, массаж, спа, веники и прочее',
      '26. Пребывание сверх оплаченного времени оплачивается как доплата за минуты',
      '27. При неспособности заплатить деньги взыскиваются по закону РФ',
      '28. Посетитель может досрочно прекратить сеанс без возврата денег',
      '29. При технических неполадках возврат денег не производится',
      '30. Рекомендуется иметь медицинскую справку о разрешении на посещение бассейна',
      '31. Вход осуществляется в сменной обуви, верхняя одежда в гардероб',
      '32. Летом верхнюю одежду оставляют в пакете в шкафчике',
      '33. Комплекс не несёт ответственность за утерянные вещи в шкафчиках',
      '34. Не рекомендуется иметь украшения, цепочки, браслеты, часы, серьги',
      '35. Началом посещения считается пересечение турникета на вход',
    ],
  },
  recommended: {
    title: 'Рекомендуется',
    items: [
      '36. Пройдя через турникет, переодеться в купальный костюм и обувь на резиновой подошве',
      '37. Использовать купальные костюмы без висящих элементов и металлических предметов',
      '38. Дети до 3 лет должны быть в непромокаемых подгузниках',
      '39. Одежду складывать в персональный шкафчик с номером на браслете',
      '40. Обязательно принять душ до и после посещения водно-термальной зоны',
      '41. Запрещается вносить моющие средства в стеклянной таре',
      '42. При недомоганиях обратиться к администратору',
      '43. На лестницах держаться за поручни, запрещено бегать и толкаться',
      '44. В саунах использовать полотенце',
      '45. Ознакомиться с правилами безопасности компонентов перед использованием',
    ],
  },
  prohibitedGeneral: {
    title: 'Запрещается (общие правила)',
    items: [
      '46. Проводить индивидуальные процедуры личной гигиены (бритьё, стирка)',
      '47. Посещение бань/саун при повышенной чувствительности к температуре',
      '48. После бань/саун принять душ перед бассейном',
      '49. Несовершеннолетние до 18 лет должны быть в сопровождении совершеннолетних',
      '50. Детям до 18 лет запрещено посещать бани/сауны без наблюдения родителей',
    ],
  },
  hammam: {
    title: 'В хаммаме',
    items: [
      '51. Не прислоняться к местам выхода пара в хаммаме',
      '52. Не оставлять детей без присмотра в хаммаме',
      '53. Слишком долгое пребывание в хаммаме опасно для здоровья',
    ],
  },
  sauna: {
    title: 'В парных и банях',
    items: [
      '54. Избегать соприкосновения с электрокаменкой (риск ожогов)',
      '55. Использовать полотенце в парных высокой температуры',
      '56. Изучить информационную табличку компонента перед использованием',
      '57. Запрещено использовать закрытые на техническое обслуживание компоненты',
      '58. Технические характеристики указаны на информационных табличках',
      '59. Запрещено посещать бани/парные/бассейны в состоянии опьянения',
      '60. Запрещено входить в бани/сауны/бассейны с едой и напитками',
      '61. Запрещено использовать личные средства гигиены в парной',
      '62. Запрещено подливать воду на камни (кроме русской парной)',
      '63. Запрещено проведение коллективных парений с веером без банщика',
      '64. Нельзя резко вставать после парения',
      '65. Запрещены действия, создающие опасные ситуации',
      '66. Посетитель должен учитывать медицинские противопоказания',
      '67. Администрация может остановить работу парной без возврата денег',
      '68. Ответственность за травмы при нарушении правил лежит на посетителе',
      '69. Полная материальная ответственность за вмешательство в оборудование',
      '70. Запрещено использовать парную, закрытую на техническое обслуживание',
    ],
  },
  mud: {
    title: 'В зоне грязевых процедур',
    items: [
      '71. Использование зоны грязевых процедур под ответственность посетителя',
      '72. Косметические составы имеют медицинские противопоказания',
      '73. Комплекс не несёт ответственность за последствия применения составов',
      '74. Перед использованием изучить инструкции в зоне грязевых процедур',
      '75. Не использовать составы иными способами, не выходить за пределы с составами, не смешивать, не бегать',
      '76. Учитывать медицинские противопоказания к грязевым процедурам',
      '77. Администрация может остановить работу зоны без возврата денег',
      '78. Ответственность за травмы при нарушении лежит на посетителе',
    ],
  },
  pool: {
    title: 'В бассейнах и водно-развлекательной зоне',
    items: [
      '79. Перед и после водно-развлекательной зоны принять душ',
      '80. Несовершеннолетние до 18 лет только в сопровождении совершеннолетних',
      '81. Ознакомиться с правилами безопасности аттракционов перед использованием',
      '82. Не умеющие плавать должны надеть спасательный жилет',
      '83. В соляном бассейне обратить внимание на высокую концентрацию соли',
      '84. Запрещено: прыгать, нырять, удерживать под водой, кричать, использовать акробатику, входить без душа, ходить в туалет в чаше, входить/выходить в неустановленных местах',
      '85. Купальные костюмы могут прийти в негодность, претензии не принимаются',
      '86. Изучить информационную табличку бассейна/аттракциона',
      '87. Запрещено использовать закрытые на техническое обслуживание бассейны',
      '88. Ответственность за травмы лежит на посетителе',
      '89. Ознакомиться с правилами безопасности перед посещением бассейна',
      '90. Учитывать наличие выступов (ступеней) под водой',
      '91. Под водой находятся элементы оборудования (гидромассаж, водопад)',
      '92. Администрация может остановить работу бассейна без возврата денег',
      '93. Ответственность за травмы лежит на посетителе',
      '94. Запрещено использовать закрытые на обслуживание бассейны',
    ],
  },
  medicalPool: {
    title: 'Соляной бассейн — противопоказания',
    items: [
      '95. Не рекомендуется посещение при: сердечно-сосудистых заболеваниях, онкологии, повреждениях кожи, беременности, менструации, гипертонии III степени',
      '96. Не находиться в соляном бассейне более 15 минут без перерыва',
      '97. При попадании соленой воды промыть слизистые пресной водой',
      '98. После соляного бассейна принять душ и вымыть руки',
    ],
  },
  behavior: {
    title: 'Поведение на территории',
    items: [
      '99. Запрещено быстро ходить или бегать (риск падений)',
      '100. Запрещено громко разговаривать и кричать в терморелаксационной зоне',
    ],
  },
  additionalProhibitions: {
    title: 'Дополнительные запреты',
    items: [
      '101. Запрещено курение (включая электронные сигареты) — штраф 5000 рублей',
      '102. Запрещена торговля и реклама без разрешения',
      '103. Запрещено приносить оружие, колюще-режущие предметы, взрывчатые вещества',
      '104. Оборудование проходит ежедневную дезинфекцию, личные игрушки запрещены',
      '105. Запрещено находиться лицам с инфекционными, вирусными заболеваниями',
      '106. Запрещено вносить детские коляски, сумки на колёсах, велосипеды',
      '107. Запрещено приносить продукты и напитки (штраф 3000 рублей, кроме детского питания до 3 лет в упаковке)',
      '108. Запрещено входить в технические помещения и вмешиваться в оборудование',
      '109. Запрещено оставлять полотенца и одежду в банях/саунах',
      '110. Запрещено осуществлять приём пищи в неотведённых местах',
      '111. Запрещено залезать на ограждения, взбираться на конструкции, кататься на перилах',
      '112. Запрещено оставлять сменную обувь так, чтобы она препятствовала другим',
    ],
  },
  visitorRights: {
    title: 'Права и обязанности посетителя',
    items: [
      '113. Посетитель имеет право на: информацию, качественные услуги, безопасность',
      '114. Посетитель обязан: ознакомиться с правилами, следить за детьми, соблюдать правила, бережно относиться к имуществу',
      '115. Информацию о безопасности можно получить от администраторов и инструкторов',
    ],
  },
  adminRights: {
    title: 'Права администрации',
    items: [
      '116. Администрация обязана: предоставлять информацию, обеспечивать безопасность, уведомлять об остановке работ',
      '117. Администрация имеет право не допускать: несовершеннолетних без сопровождения, нарушающих порядок, не заполнивших расписку',
      '118. Администрация имеет право: отказать без объяснений, прекратить приём платежей, провести визуальный осмотр, вывести нарушителей без возврата денег',
      '119. Администрация может остановить работу при: санитарной обработке, ремонте, технических перерывах, аварийных ситуациях, форс-мажоре',
      '120. Администрация несёт ответственность по законодательству РФ',
    ],
  },
  claims: {
    title: 'Претензии',
    items: [
      '121. Претензии должны быть в письменном виде',
      '122. Порядок удовлетворения претензий по законодательству РФ',
    ],
  },
  visitorResponsibility: {
    title: 'Ответственность посетителя',
    items: [
      '123. Посетитель несёт ответственность за: детей, нарушения, ущерб, браслет, аварии',
      '124. Администрация не несёт ответственность за несовершеннолетних без присмотра',
      '125. Комплекс не хранит вещи, не несёт ответственность за утерянное имущество',
      '126. При нарушении правил администрация не рассматривает претензии',
      '127. Ответственность за травмы лежит на посетителе',
      '128. При ущербе обратиться к администратору для фиксации',
      '129. За технические неудобства коммунальных служб комплекс не отвечает',
    ],
  },
  photo: {
    title: 'Фото и видеоматериалы',
    items: [
      '130. Согласие на использование изображений и видеоматериалов в рекламе без вознаграждения',
    ],
  },
  firstAid: {
    title: 'Первая помощь',
    items: [
      '131. При травме обратиться к администратору для акта происшествия',
      '132. Сотрудники оказывают первую помощь из аптечек и навыков',
      '133. При травме администрация предложит вызвать скорую помощь',
      '134. Аптечки находятся: у кассы, в зоне массажа, у администрации, у инструктора-спасателя',
    ],
  },
  emergency: {
    title: 'Чрезвычайные ситуации',
    items: [
      '135. Порядок действий: не паниковать, выполнять команды персонала, эвакуация детей взрослыми, использовать аварийные выходы, места сбора за пределами территории',
      '136. На входе информация об условных обозначениях',
      '137. Правила размещены на информационном стенде и сайте termburg.ru',
    ],
  },
};

function FullRulesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [onClose]);

  const sectionIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    general: ScrollText,
    children: Baby,
    services: ScrollText,
    recommended: Heart,
    prohibitedGeneral: Ban,
    hammam: Flame,
    sauna: Flame,
    mud: Droplets,
    pool: Droplets,
    medicalPool: AlertTriangle,
    behavior: Ban,
    additionalProhibitions: Ban,
    visitorRights: ScrollText,
    adminRights: ShieldCheck,
    claims: ScrollText,
    visitorResponsibility: ScrollText,
    photo: Camera,
    firstAid: Heart,
    emergency: Phone,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Полный свод правил</h2>
              <p className="text-sm text-text-secondary">Комплекс «Термбург»</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-warm flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {Object.entries(fullRulesData).map(([key, section]) => {
            const IconComponent = sectionIcons[key] ?? ScrollText;
            return (
              <div key={key} className="rounded-xl bg-surface-warm border border-border/50 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-text-primary">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

const galleryPhotos = [
  { src: '/images/complex/pool.webp', alt: 'Бассейн' },
  { src: '/images/complex/gallery9.webp', alt: 'Зона отдыха' },
  { src: '/images/complex/herbal.webp', alt: 'Травяная парная' },
  { src: '/images/complex/gallery10.webp', alt: 'Термальная зона' },
  { src: '/images/complex/barrels.webp', alt: 'Бани-бочки' },
  { src: '/images/complex/gallery11.webp', alt: 'Парная с камнями' },
  { src: '/images/complex/gallery5.webp', alt: 'Интерьер' },
  { src: '/images/complex/gallery12.webp', alt: 'Парная' },
  { src: '/images/complex/gallery6.webp', alt: 'Каменка' },
  { src: '/images/complex/gallery13.webp', alt: 'Зона релаксации' },
  { src: '/images/complex/gallery4.webp', alt: 'Отдых' },
  { src: '/images/complex/gallery14.webp', alt: 'Термальный комплекс' },
];

export default function AboutPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «about» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('about');
  const { data: aboutContent } = useAboutContent();
  const { data: zonesData } = useZonesData();
  const zoneCategories = useMemo(() => mapZonesDataToCategories(zonesData.zones), [zonesData.zones]);
  const displayVisitRules = useMemo(() => {
    const rules = aboutContent.visitRules
      ?.map((rule) => {
        const title = rule.title?.trim() || '';
        const description = rule.description?.trim() || '';
        if (title && description) return `${title}: ${description}`;
        return title || description;
      })
      .filter(Boolean);

    return rules?.length ? rules : visitRules;
  }, [aboutContent.visitRules]);
  const displayGalleryPhotos = useMemo(() => {
    const photos = aboutContent.galleryPhotos
      ?.filter((photo) => photo.image)
      .map((photo) => ({
        src: photo.image,
        alt: photo.alt || photo.caption || 'Термбург',
      }));

    return photos?.length ? photos : galleryPhotos;
  }, [aboutContent.galleryPhotos]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneCategory | null>(null);
  const [showFullRules, setShowFullRules] = useState(false);

  // Fetch team from WordPress API with fallback
  const { data: teamMembers, loading: teamLoading } = useTeamWithFallback();

  return (
    <PageLayout>
      <PageHero
        title="О Термбурге"
        backgroundImage="/images/heroes/about.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Intro */}
      <Section>
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Text — 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
              Тепло пожаловать в Термбург
            </h2>
            <p className="text-lg leading-relaxed text-text-primary">
              Представьте себе уголок, где время течет иначе. Где жар русской бани с ароматным веником сменяется нежной лаской хаммама, а целебный воздух соляной сауны наполняет легкие свежестью. Это не просто термальный комплекс. Термбург — это портал в мир истинного отдыха, созданный для вашей семьи.
            </p>

            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Здесь каждый найдет свою историю:</h3>
              <ul className="space-y-2 text-text-secondary leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">&#8226;</span>
                  <span>Почувствуйте силу предков в русской, сибирской или шаманской парной под руководством лучших пармастеров.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">&#8226;</span>
                  <span>Позвольте коже дышать в травяной сауне, а ногам — мягко согреваться в песчаной, которая так нравится нашим самым маленьким гостям.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">&#8226;</span>
                  <span>Окунитесь в прохладу уличной купели, в тепло большого бассейна или расслабьтесь в гидромассажной ванне, пока малыши плещутся в своем, безопасном уголке.</span>
                </li>
              </ul>
            </div>

            <p className="text-lg leading-relaxed text-text-secondary">
              Но Термбург — это больше, чем вода и пар. Это место встречи с душой славянства. Пока вы будете пить травяной чай на уютной террасе (летом — ловить лучи загара, а зимой — париться в бане-бочке и наслаждаться в теплой купели с гидромассажем под открытым небом), вас окружат древние легенды. Здесь живут термлины — добрые духи, которые хранят уют и рассказывают истории о наших корнях.
            </p>
            <p className="text-lg leading-relaxed text-text-primary">
              Мы приглашаем вас не просто поправить здоровье, а восстановить душевное равновесие, прикоснуться к культуре и увезти с собой тепло в сердце.
            </p>
            <p className="text-lg leading-relaxed text-text-primary font-medium">
              Подарите себе этот день — яркий, теплый и немного волшебный. Термбург ждет вас, чтобы подарить человеческое счастье!
            </p>
            <p className="text-primary font-medium italic">
              Тепло пожаловать в гости — за новыми силами и старыми традициями!
            </p>
          </div>

          {/* Image — 2 columns */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <Link to="/termliny" className="block group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <img
                  src="/images/termliny/yaromir.webp"
                  alt="Яромир — главный термлин Термбурга"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-heading font-bold text-lg">Яромир</p>
                  <p className="text-white/70 text-sm">Главный термлин Термбурга</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-4 text-center group-hover:bg-primary/10 transition-colors">
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  «Я храню тепло этого места и встречаю каждого гостя как родного»
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Section>

      {/* Gallery + Rules side by side */}
      <Section title="Наше пространство" warm>
        {/* Zones */}
        <div className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {zoneCategories.map((zone) => (
              <Card
                key={zone.id}
                className="p-0 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedZone(zone)}
              >
                <div className="relative h-48 overflow-hidden">
                  <WPImage
                    src={zone.image}
                    alt={zone.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-xl font-bold text-white">{zone.name}</h3>
                    <p className="text-sm text-white/80">{zone.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT — Фотогалерея */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-4">Фотогалерея</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayGalleryPhotos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  className="aspect-[4/3] overflow-hidden rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Открыть фото: ${photo.alt}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Правила посещения */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-4">Правила посещения</h3>
            <div className="mb-4 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Для вашего комфорта и безопасности</span>
            </div>
            <div className="space-y-3">
              {displayVisitRules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl bg-surface p-4 border border-border/50"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-text-primary">{rule}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowFullRules(true)}
              className="mt-6 flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
            >
              <ListChecks className="h-4 w-4" />
              <span className="underline underline-offset-2">Полный свод правил</span>
            </button>
          </div>
        </div>
      </Section>

      {/* Team / Employees */}
      <Section title="Наша команда" subtitle="Профессионалы своего дела">
        {teamLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !teamMembers || teamMembers.length === 0 ? (
          <div className="text-center text-muted py-12">
            <p>Информация о команде загружается...</p>
          </div>
        ) : (
          <div className={`grid gap-6 max-w-4xl mx-auto ${teamMembers.length === 1 ? 'max-w-md' : teamMembers.length === 2 ? 'md:grid-cols-2 max-w-2xl' : 'md:grid-cols-3 lg:grid-cols-4'}`}>
            {teamMembers.map((member, idx) => (
              <div
                key={member.id}
                className={`relative flex flex-col items-center text-center rounded-2xl bg-gradient-to-b from-primary/5 to-surface p-6 border border-primary/20 ${idx === 0 && teamMembers.length > 1 ? 'md:-mt-4 md:scale-105 ring-2 ring-primary/30' : ''}`}
              >
                {idx === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-dark-surface text-xs font-bold px-4 py-1 rounded-full">
                    🏆 Лучший
                  </div>
                )}
                <img
                  src={member.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundType=gradientLinear&fontWeight=600`}
                  alt={member.name}
                  className={`rounded-full mb-3 bg-primary/5 ${idx === 0 ? 'w-24 h-24 ring-4 ring-primary/20' : 'w-20 h-20 ring-2 ring-primary/10'}`}
                />
                {/* 5 Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <h3 className={`font-bold text-text-primary ${idx === 0 ? 'text-lg' : 'text-base'}`}>{member.name}</h3>
                <p className="text-xs font-medium text-primary mt-1">{member.role}</p>
                {member.experience && <p className="text-xs text-text-secondary">Опыт: {member.experience}</p>}
                <p className="text-text-secondary text-sm mt-2 leading-relaxed line-clamp-3">{member.description}</p>
                {member.quote && (
                  <div className="mt-3 text-xs text-text-secondary italic">
                    «{member.quote}»
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={displayGalleryPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Zone Modal */}
      {selectedZone && (
        <ZoneModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      )}

      {/* Full Rules Modal */}
      {showFullRules && (
        <FullRulesModal onClose={() => setShowFullRules(false)} />
      )}
    </PageLayout>
  );
}
