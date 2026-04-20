export interface Employee {
  id: string;
  name: string;
  role: string;
  description: string;
  quote: string;
  avatar?: string;
}

export const defaultEmployeesOfMonth: Employee[] = [
  {
    id: '1',
    name: 'Дмитрий Козлов',
    role: 'Шеф-банщик',
    description: 'Мастер авторских парений, 15 лет опыта',
    quote: 'За мастерство и преданность традициям русской бани',
  },
  {
    id: '2',
    name: 'Марина Волкова',
    role: 'SPA-директор',
    description: 'Сертифицированный специалист по термальным процедурам',
    quote: 'За профессионализм и заботу о гостях',
  },
  {
    id: '3',
    name: 'Елена Соколова',
    role: 'Администратор',
    description: 'Заботится о комфорте каждого гостя',
    quote: 'За внимательность и позитивный настрой',
  },
];

const STORAGE_KEY = 'termburg_employees_of_month';

export function getEmployeesOfMonth(): Employee[] {
  if (typeof window === 'undefined') return defaultEmployeesOfMonth;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultEmployeesOfMonth;
    }
  }
  return defaultEmployeesOfMonth;
}

export function saveEmployeesOfMonth(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function resetEmployeesOfMonth(): void {
  localStorage.removeItem(STORAGE_KEY);
}
