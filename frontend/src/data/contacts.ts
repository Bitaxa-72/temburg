export interface SocialLinks {
  vk: string;
  max: string;
  instagram: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  number: number;
  text: string;
  image?: string;
}

export interface RouteDirection {
  id: string;
  title: string;
  icon: 'metro' | 'car' | 'bus';
  steps: RouteStep[];
}

export interface ContactInfo {
  phone: string;
  address: string;
  metro: string;
  email: string;
  workingHours: string;
  social: SocialLinks;
  coordinates: Coordinates;
  howToGet: RouteDirection[];
}

export const contactInfo: ContactInfo = {
  phone: '+7 (909) 167-47-46',
  address: 'г. Москва, ул. Гурьянова, д. 30, 2 этаж',
  metro: 'м. Печатники',
  email: 'info@termburg.ru',
  workingHours: 'Ежедневно с 9:00 до 23:00 (кроме 1-го пн месяца — сан. день)',
  social: {
    vk: 'https://vk.com/termburg',
    max: 'https://max.ru/u/f9LHodD0cOI6sfpVks80RBneR0F0vcTuG1GR1uS9Qky2HrPEneRTITCt7Lg',
    instagram: 'https://instagram.com/termburg',
  },
  coordinates: {
    lat: 55.680707,
    lng: 37.715830,
  },
  howToGet: [
    {
      id: 'metro',
      title: 'От метро',
      icon: 'metro',
      steps: [
        { number: 1, text: 'Выйдите на станции метро Печатники (Выход 5)' },
        { number: 2, text: 'Поднимайтесь на улицу, идите прямо к автобусной остановке и ожидайте автобус номер 292' },
        { number: 3, text: 'Проедьте до остановки «Гурьянова д.55» (примерное время в автобусе 15 минут)' },
        { number: 4, text: 'Выходите на остановке, поверните направо и идите к ТЦ «Серф Плаза»' },
        { number: 5, text: 'Заходите в главный вход, дверь справа — вам туда!' },
      ],
    },
    {
      id: 'car',
      title: 'На автомобиле',
      icon: 'car',
      steps: [
        { number: 1, text: 'Введите в навигатор адрес: Гурьянова д.30' },
        { number: 2, text: 'Бесплатная парковка перед зданием торгового центра или в ближайших дворах' },
      ],
    },
  ],
};
