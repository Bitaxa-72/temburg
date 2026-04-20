import { Sparkles, Heart, Sun, Star, Flame, Leaf, Home, Wind, Brain, HeartHandshake, Droplets, Moon, Cloud, Zap, Shield, type LucideIcon } from 'lucide-react';

export interface Wish {
  title: string;
  description: string;
  termlinIndex: number;
  icon: LucideIcon;
}

// 100 уникальных пожеланий от термлинов
export const wishes: Wish[] = [
  // Яромир (0) - огонь, пар, тепло
  { title: 'Доброго дня и лёгкого пара!', description: 'Пусть тепло Термбурга согреет вашу душу и подарит гармонию', termlinIndex: 0, icon: Sun },
  { title: 'Пусть пар будет лёгким!', description: 'А тело — здоровым и отдохнувшим после парной', termlinIndex: 0, icon: Flame },
  { title: 'Тепла вашему сердцу!', description: 'Пусть огонь очага согревает вас в любую погоду', termlinIndex: 0, icon: Flame },
  { title: 'Жаркого и доброго!', description: 'Пусть жар парной прогонит все недуги и усталость', termlinIndex: 0, icon: Sun },
  { title: 'Силы огня вам!', description: 'Огонь очищает и даёт энергию для новых свершений', termlinIndex: 0, icon: Zap },
  { title: 'Пусть пламя согреет!', description: 'В холодный день — тёплая баня, в тёплый — лёгкий пар', termlinIndex: 0, icon: Flame },
  { title: 'Доброго жара!', description: 'Настоящий жар — это когда душа отдыхает', termlinIndex: 0, icon: Sun },
  { title: 'Пара и здоровья!', description: 'Баня парит — здоровье дарит', termlinIndex: 0, icon: Flame },
  { title: 'Огненной энергии!', description: 'Пусть внутренний огонь горит ярко и даёт силы', termlinIndex: 0, icon: Zap },
  { title: 'Тёплых мгновений!', description: 'Пусть каждый миг будет наполнен теплом и заботой', termlinIndex: 0, icon: Sun },
  { title: 'Жара без угара!', description: 'Правильный пар — залог здоровья и долголетия', termlinIndex: 0, icon: Flame },
  { title: 'Пусть огонь очистит!', description: 'Огонь сжигает всё лишнее, оставляя чистоту', termlinIndex: 0, icon: Flame },
  { title: 'Согревающего отдыха!', description: 'Отдых в тепле восстанавливает силы втрое быстрее', termlinIndex: 0, icon: Sun },
  { title: 'Банного благополучия!', description: 'Кто в бане парится, тот долго не старится', termlinIndex: 0, icon: Flame },

  // Валькирия (1) - травы, исцеление, здоровье
  { title: 'Крепкого здоровья!', description: 'Заботьтесь о себе — вы этого достойны. Травы исцелят тело и душу', termlinIndex: 1, icon: Heart },
  { title: 'Целебной силы трав!', description: 'Природа дарит нам всё для здоровья и долголетия', termlinIndex: 1, icon: Leaf },
  { title: 'Исцеления и покоя!', description: 'Пусть травяной пар принесёт облегчение и радость', termlinIndex: 1, icon: Heart },
  { title: 'Здоровья и бодрости!', description: 'Каждый день — новая возможность стать здоровее', termlinIndex: 1, icon: Leaf },
  { title: 'Травяного благословения!', description: 'Сила трав накоплена веками для вашего здоровья', termlinIndex: 1, icon: Leaf },
  { title: 'Лёгкости в теле!', description: 'Пусть усталость уйдёт, а тело наполнится силой', termlinIndex: 1, icon: Heart },
  { title: 'Природной энергии!', description: 'Всё, что нужно для здоровья, дала нам природа', termlinIndex: 1, icon: Leaf },
  { title: 'Чистоты помыслов!', description: 'Чистое тело — чистые мысли, здоровый дух', termlinIndex: 1, icon: Heart },
  { title: 'Долголетия и сил!', description: 'Секрет долголетия в простых вещах — баня и травы', termlinIndex: 1, icon: Leaf },
  { title: 'Целительного покоя!', description: 'В тишине и тепле тело само находит исцеление', termlinIndex: 1, icon: Heart },
  { title: 'Ароматного отдыха!', description: 'Травяные ароматы успокаивают и восстанавливают', termlinIndex: 1, icon: Leaf },
  { title: 'Бодрости духа!', description: 'Здоровое тело — здоровый дух, и наоборот', termlinIndex: 1, icon: Heart },
  { title: 'Силы от природы!', description: 'Природа щедра к тем, кто умеет принимать её дары', termlinIndex: 1, icon: Leaf },
  { title: 'Травяного чуда!', description: 'Каждая травинка несёт свою целебную силу', termlinIndex: 1, icon: Leaf },

  // Переслав (2) - дом, уют, веселье
  { title: 'Сил и энергии!', description: 'Пусть каждый день будет наполнен светом и радостью жизни', termlinIndex: 2, icon: Star },
  { title: 'Домашнего уюта!', description: 'Пусть тепло дома согревает вас где бы вы ни были', termlinIndex: 2, icon: Home },
  { title: 'Радости и смеха!', description: 'Смех продлевает жизнь — смейтесь чаще!', termlinIndex: 2, icon: Star },
  { title: 'Хорошего настроения!', description: 'Настроение — это выбор. Выбирайте радость!', termlinIndex: 2, icon: Star },
  { title: 'Порядка в делах!', description: 'Порядок снаружи — порядок внутри', termlinIndex: 2, icon: Home },
  { title: 'Семейного счастья!', description: 'Семья — это там, где вас любят и ждут', termlinIndex: 2, icon: HeartHandshake },
  { title: 'Весёлых моментов!', description: 'Жизнь состоит из моментов — пусть они будут яркими', termlinIndex: 2, icon: Star },
  { title: 'Уютных вечеров!', description: 'Нет ничего лучше тёплого вечера в кругу близких', termlinIndex: 2, icon: Home },
  { title: 'Доброго смеха!', description: 'Добрая шутка лечит душу лучше лекарства', termlinIndex: 2, icon: Star },
  { title: 'Гармонии в доме!', description: 'Когда дома хорошо — хорошо везде', termlinIndex: 2, icon: Home },
  { title: 'Светлых мыслей!', description: 'Светлые мысли притягивают светлые события', termlinIndex: 2, icon: Star },
  { title: 'Тепла родных стен!', description: 'Дом там, где сердце, а сердце там, где любовь', termlinIndex: 2, icon: Home },
  { title: 'Искренней радости!', description: 'Радуйтесь мелочам — в них и есть счастье', termlinIndex: 2, icon: Star },
  { title: 'Семейных традиций!', description: 'Традиции связывают поколения и хранят память', termlinIndex: 2, icon: Home },

  // Казимир (3) - предсказания, ветер, терраса
  { title: 'Попутного ветра!', description: 'Пусть ветер удачи всегда дует в ваши паруса', termlinIndex: 3, icon: Wind },
  { title: 'Ясного неба!', description: 'Пусть над вами всегда будет чистое небо', termlinIndex: 3, icon: Cloud },
  { title: 'Удачи в делах!', description: 'Удача любит смелых и настойчивых', termlinIndex: 3, icon: Star },
  { title: 'Верных решений!', description: 'Интуиция подскажет правильный путь', termlinIndex: 3, icon: Wind },
  { title: 'Свежего ветра!', description: 'Ветер перемен приносит новые возможности', termlinIndex: 3, icon: Wind },
  { title: 'Чистого воздуха!', description: 'Глубокий вдох свежего воздуха даёт силы', termlinIndex: 3, icon: Cloud },
  { title: 'Лёгкого пути!', description: 'Пусть дорога будет лёгкой, а цель — близкой', termlinIndex: 3, icon: Wind },
  { title: 'Ясности мыслей!', description: 'Ясный ум — ключ к верным решениям', termlinIndex: 3, icon: Cloud },
  { title: 'Прозорливости!', description: 'Умение видеть наперёд — великий дар', termlinIndex: 3, icon: Star },
  { title: 'Ветра в спину!', description: 'Когда ветер помогает, идти легче вдвойне', termlinIndex: 3, icon: Wind },
  { title: 'Воздушной лёгкости!', description: 'Пусть все заботы развеются как облака', termlinIndex: 3, icon: Cloud },
  { title: 'Хитрости и ума!', description: 'Иногда хитрость важнее силы', termlinIndex: 3, icon: Star },
  { title: 'Звёздного неба!', description: 'Звёзды всегда укажут путь тем, кто умеет смотреть', termlinIndex: 3, icon: Moon },
  { title: 'Предчувствия удачи!', description: 'Верьте своим предчувствиям — они редко ошибаются', termlinIndex: 3, icon: Wind },

  // Ведагор (4) - мудрость, спокойствие, философия
  { title: 'Гармонии и спокойствия!', description: 'Найдите свой баланс в наших парных и обретите внутренний покой', termlinIndex: 4, icon: Sparkles },
  { title: 'Мудрости и терпения!', description: 'Мудрость приходит к тем, кто умеет ждать', termlinIndex: 4, icon: Brain },
  { title: 'Внутреннего покоя!', description: 'Покой внутри — покой снаружи', termlinIndex: 4, icon: Sparkles },
  { title: 'Ясного ума!', description: 'Ясный ум видит суть вещей за их формой', termlinIndex: 4, icon: Brain },
  { title: 'Глубоких мыслей!', description: 'В глубине — истина, на поверхности — суета', termlinIndex: 4, icon: Sparkles },
  { title: 'Философского спокойствия!', description: 'Всё проходит — и хорошее, и плохое. Помните об этом', termlinIndex: 4, icon: Brain },
  { title: 'Мудрых решений!', description: 'Мудрость — это умение видеть последствия', termlinIndex: 4, icon: Sparkles },
  { title: 'Тишины и медитации!', description: 'В тишине рождаются великие мысли', termlinIndex: 4, icon: Moon },
  { title: 'Познания себя!', description: 'Познай себя — познаешь весь мир', termlinIndex: 4, icon: Brain },
  { title: 'Душевного равновесия!', description: 'Равновесие — ключ к счастливой жизни', termlinIndex: 4, icon: Sparkles },
  { title: 'Созерцательности!', description: 'Иногда нужно остановиться и просто наблюдать', termlinIndex: 4, icon: Moon },
  { title: 'Мудрости веков!', description: 'Древняя мудрость актуальна во все времена', termlinIndex: 4, icon: Brain },
  { title: 'Исполнения желаний!', description: 'Желания сбываются у тех, кто умеет их загадывать', termlinIndex: 4, icon: Sparkles },
  { title: 'Вдохновения свыше!', description: 'Вдохновение приходит к подготовленным', termlinIndex: 4, icon: Star },

  // Милован (5) - любовь, семья, страсть
  { title: 'Любви и страсти!', description: 'Пусть огонь любви горит в вашем сердце вечно', termlinIndex: 5, icon: Heart },
  { title: 'Крепкого союза!', description: 'Настоящий союз крепнет с каждым годом', termlinIndex: 5, icon: HeartHandshake },
  { title: 'Взаимной любви!', description: 'Любовь — это когда двое становятся единым целым', termlinIndex: 5, icon: Heart },
  { title: 'Семейного тепла!', description: 'Семья — это крепость, где всегда тепло', termlinIndex: 5, icon: HeartHandshake },
  { title: 'Романтики!', description: 'Не забывайте о романтике — она питает любовь', termlinIndex: 5, icon: Heart },
  { title: 'Верности и доверия!', description: 'Верность — фундамент крепких отношений', termlinIndex: 5, icon: Shield },
  { title: 'Нежности!', description: 'Нежность — это язык любви, который понимают все', termlinIndex: 5, icon: Heart },
  { title: 'Огня в сердце!', description: 'Пусть сердце всегда горит огнём любви', termlinIndex: 5, icon: Flame },
  { title: 'Счастья в паре!', description: 'Вместе — теплее, вместе — веселее, вместе — сильнее', termlinIndex: 5, icon: HeartHandshake },
  { title: 'Взаимопонимания!', description: 'Понимать без слов — высшее искусство любви', termlinIndex: 5, icon: Heart },
  { title: 'Страстных ночей!', description: 'Страсть — это пламя, которое нужно поддерживать', termlinIndex: 5, icon: Flame },
  { title: 'Любящих глаз!', description: 'Глаза любимого человека — лучшее зеркало', termlinIndex: 5, icon: Heart },
  { title: 'Крепких объятий!', description: 'Объятия лечат лучше любых лекарств', termlinIndex: 5, icon: HeartHandshake },
  { title: 'Вечной молодости чувств!', description: 'Любовь не знает возраста — она вечно молода', termlinIndex: 5, icon: Heart },

  // Леля (6) - вода, дети, защита
  { title: 'Чистоты и свежести!', description: 'Пусть вода смоет всё лишнее и даст чистоту', termlinIndex: 6, icon: Droplets },
  { title: 'Защиты и покоя!', description: 'Под защитой небес вам ничего не страшно', termlinIndex: 6, icon: Shield },
  { title: 'Детского смеха!', description: 'Дети — цветы жизни, берегите их', termlinIndex: 6, icon: Star },
  { title: 'Плавности движений!', description: 'Двигайтесь плавно, как вода, — и всё получится', termlinIndex: 6, icon: Droplets },
  { title: 'Материнской любви!', description: 'Любовь матери — самая чистая любовь на свете', termlinIndex: 6, icon: Heart },
  { title: 'Чистых помыслов!', description: 'Чистые помыслы притягивают чистые события', termlinIndex: 6, icon: Droplets },
  { title: 'Нежной заботы!', description: 'Забота о близких — высшее проявление любви', termlinIndex: 6, icon: HeartHandshake },
  { title: 'Водной стихии!', description: 'Вода — начало всего, источник жизни', termlinIndex: 6, icon: Droplets },
  { title: 'Защиты детей!', description: 'Дети под защитой Лели в безопасности', termlinIndex: 6, icon: Shield },
  { title: 'Светлых начинаний!', description: 'Каждое начинание — это шанс стать лучше', termlinIndex: 6, icon: Sun },
  { title: 'Плодородия!', description: 'Пусть все ваши начинания приносят плоды', termlinIndex: 6, icon: Leaf },
  { title: 'Цветущей красоты!', description: 'Красота — дар природы, который нужно беречь', termlinIndex: 6, icon: Star },
  { title: 'Текучей гибкости!', description: 'Будьте гибкими как вода — обтекайте препятствия', termlinIndex: 6, icon: Droplets },
  { title: 'Весеннего обновления!', description: 'Каждый день — шанс начать всё заново', termlinIndex: 6, icon: Sun },
];

// Функция для получения случайного пожелания
export function getRandomWish(): Wish {
  return wishes[Math.floor(Math.random() * wishes.length)];
}

// Функция для перемешивания без повторения персонажей подряд
export function shuffleWishes(): Wish[] {
  const shuffled: Wish[] = [];
  const remaining = [...wishes];

  // Перемешиваем исходный массив
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  // Собираем массив так, чтобы один персонаж не шёл за таким же
  while (remaining.length > 0) {
    const lastTermlin = shuffled.length > 0 ? shuffled[shuffled.length - 1].termlinIndex : -1;

    // Ищем пожелание от другого персонажа
    let foundIndex = remaining.findIndex(w => w.termlinIndex !== lastTermlin);

    // Если не нашли (остались только от одного персонажа), берём первое
    if (foundIndex === -1) {
      foundIndex = 0;
    }

    shuffled.push(remaining[foundIndex]);
    remaining.splice(foundIndex, 1);
  }

  return shuffled;
}
