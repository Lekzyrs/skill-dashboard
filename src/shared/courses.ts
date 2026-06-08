// Каталог рекомендованных курсов — мой ресерч, версионируется в коде.
// Прогресс по курсу хранится отдельно (в frontmatter заметки, ключ по Course.id).
// Курсо-центричный формат: один курс тегируется темами, которые покрывает.
//   - topics: relativePath заметок vault (тема показывает курсы, у которых она в topics)
//   - areas:  общие области фронтенда вне записанных тем (CSS, тестирование, ...)
// Данные сверены по источникам июнь 2026; title/url/updated проверять при будущем ресерче.

export interface Course {
  /** Стабильный id для ключа прогресса во frontmatter. Не менять после релиза. */
  id: string
  title: string
  author: string
  /** Площадка: Udemy, Frontend Masters, ... */
  platform: string
  url: string
  /** Часы видео, если применимо (у воркшопов/интерактива бывает не указано). */
  hours?: number
  /** Уровень: 'beginner→advanced', 'intermediate→advanced', ... */
  level: string
  /** Доступ: 'paid' | 'subscription' | 'free-tier' (есть бесплатная часть) | 'free'. */
  access: 'paid' | 'subscription' | 'free-tier' | 'free'
  /** Актуальность: когда контент последний раз обновлялся (honest-сигнал свежести). */
  updated: string
  /** relativePath заметок vault, которые курс покрывает. */
  topics: string[]
  /** Общие области фронтенда вне vault (см. AREAS). Необязательно. */
  areas?: string[]
  /** Почему именно он. Конкретно, без рекламных оборотов. */
  why: string
}

/** Общая область фронтенда, у которой пока нет заметки в vault, но курс полезен. */
export interface Area {
  id: string
  label: string
  /** Зачем это фронтендеру, коротко. */
  note: string
}

// --- темы vault (relativePath заметок) ---
const REACT = 'react/React - что знаю и что прокачать.md'
const TS_GENERICS = 'typescript/TS generics и строгость компилятора.md'
const CLOSURES = 'javascript/Замыкания.md'
const PROMISE = 'javascript/Promise и async-await.md'
const THIS = 'javascript/this и контекст.md'
const PROTOTYPES = 'javascript/Прототипы и классы.md'
const EVENT_LOOP = 'javascript/Event Loop микро и макротаски.md'
const DECORATORS = 'javascript/Шпаргалка декораторов.md'
const BIG_O = 'algorithms/Big O и паттерны.md'
const AST = 'advanced/AST, парсеры, Babel, ESLint - карта.md'

// --- области вне vault ---
export const AREAS: Area[] = [
  { id: 'css', label: 'CSS и вёрстка', note: 'Grid, flexbox, адаптив, анимации. База, которую легко недоучить.' },
  { id: 'testing', label: 'Тестирование', note: 'Unit, интеграционные, e2e. RTL, Vitest, Playwright.' },
  { id: 'nextjs', label: 'Next.js', note: 'App Router, серверные компоненты, server actions. Стандарт для React-проектов.' },
  { id: 'web-perf', label: 'Производительность', note: 'Загрузка, исполнение JS, рендеринг, ре-рендеры React. Core Web Vitals.' },
  { id: 'a11y', label: 'Доступность', note: 'Семантика, ARIA, фокус, скринридеры, контраст. Спрашивают на собесах.' }
]

export const COURSES: Course[] = [
  // --- React ---
  {
    id: 'max-react-complete-guide',
    title: 'React - The Complete Guide (incl. Next.js, Redux)',
    author: 'Maximilian Schwarzmüller',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    level: 'beginner→advanced',
    access: 'paid',
    updated: 'обновлён под React 19 (2025-2026)',
    topics: [REACT],
    why: 'Самый полный одиночный путь по React: основы, хуки, Redux, Next.js. 1M+ учеников, обновлён под React 19. Бери, если нужна одна большая опорная дорога.'
  },
  {
    id: 'jonas-ultimate-react',
    title: 'The Ultimate React Course 2025: React, Next.js, Redux & More',
    author: 'Jonas Schmedtmann',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/the-ultimate-react-course/',
    hours: 67,
    level: 'beginner→advanced',
    access: 'paid',
    updated: 'React 19, современный стек (2025)',
    topics: [REACT],
    why: 'Проектно-ориентированный, с глубокими объяснениями и современным стеком (React Query, Tailwind, Supabase). 4.7 на Udemy. Лучше заходит, если учишься через сборку проектов.'
  },
  {
    id: 'comeau-joy-of-react',
    title: 'The Joy of React',
    author: 'Josh W. Comeau',
    platform: 'joyofreact.com',
    url: 'https://www.joyofreact.com/',
    level: 'beginner→intermediate',
    access: 'paid',
    updated: 'React 19 + Server Components',
    topics: [REACT],
    why: 'Интерактивный курс с упражнениями в браузере, строит интуицию с нуля. Дорогой ($599), но даёт понимание, а не пересказ доков. Для тех, кому видео-лекции скучны.'
  },

  // --- TypeScript (generics + строгость + декораторы) ---
  {
    id: 'pocock-total-typescript',
    title: 'Total TypeScript',
    author: 'Matt Pocock',
    platform: 'Total TypeScript',
    url: 'https://www.totaltypescript.com/',
    level: 'intermediate→advanced',
    access: 'free-tier',
    updated: 'актуален (self-paced воркшопы)',
    topics: [TS_GENERICS],
    why: 'Прямо под твою тему: отдельные воркшопы Generics и Type Transformations (условные/mapped-типы, инференс). Упражнения, а не лекции. Есть бесплатные туториалы, платные воркшопы — глубже.'
  },
  {
    id: 'max-understanding-typescript',
    title: 'Understanding TypeScript',
    author: 'Maximilian Schwarzmüller',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/understanding-typescript/',
    hours: 22.5,
    level: 'beginner→advanced',
    access: 'paid',
    updated: 'апрель 2026 (+10ч, satisfies и пр.)',
    topics: [TS_GENERICS, DECORATORS],
    why: 'Ровный путь от основ до generics и декораторов (отдельный раздел), с интеграцией в React/Node. 4.7, обновлён в 2026. Бери как базу перед Total TypeScript, если generics пока на 2-4.'
  },

  // --- JS-ядро (один курс на несколько тем) ---
  {
    id: 'jonas-complete-js',
    title: 'The Complete JavaScript Course 2025: From Zero to Expert!',
    author: 'Jonas Schmedtmann',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/the-complete-javascript-course/',
    hours: 60,
    level: 'beginner→advanced',
    access: 'paid',
    updated: 'ES2024/ES2025 (2025-2026)',
    topics: [CLOSURES, PROMISE, THIS, PROTOTYPES, EVENT_LOOP],
    why: 'Широкая база JS: замыкания, this, прототипы, event loop, promises и async/await в одном курсе. 4.7 на 230k+ оценок. Один курс закрывает сразу несколько твоих JS-тем.'
  },
  {
    id: 'sentance-hard-parts',
    title: 'Closure, Async, and OOP: The Hard Parts of JavaScript',
    author: 'Will Sentance',
    platform: 'Frontend Masters',
    url: 'https://frontendmasters.com/courses/javascript-hard-parts-v3/',
    hours: 9.7,
    level: 'intermediate',
    access: 'subscription',
    updated: 'v3 (актуальна)',
    topics: [CLOSURES, PROMISE, THIS, PROTOTYPES, EVENT_LOOP],
    why: 'Строит точные ментальные модели замыканий, this/OOP и асинхронности (event loop, promises), глубже обзорных курсов. По подписке Frontend Masters. Бери, когда база есть, но «почему так» не щёлкает.'
  },

  // --- Алгоритмы (Big O) ---
  {
    id: 'colt-algorithms',
    title: 'JavaScript Algorithms and Data Structures Masterclass',
    author: 'Colt Steele',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/js-algorithms-and-data-structures-masterclass/',
    hours: 22,
    level: 'beginner→intermediate',
    access: 'paid',
    updated: 'обновлён 01.2026',
    topics: [BIG_O],
    why: 'От Big O и паттернов (частотный счётчик, два указателя, скользящее окно) до сортировок и структур данных, всё на JS. Эталонный курс по DSA для фронтендера, недорогой.'
  },

  // --- AST / Babel / ESLint ---
  {
    id: 'dodds-ast',
    title: 'Code Transformation and Linting with Abstract Syntax Trees',
    author: 'Kent C. Dodds',
    platform: 'Frontend Masters',
    url: 'https://frontendmasters.com/courses/linting-asts/',
    hours: 3.5,
    level: 'intermediate→advanced',
    access: 'subscription',
    updated: 'актуальна',
    topics: [AST],
    why: 'Ровно твоя тема: пишешь свой Babel-плагин, кастомные ESLint-правила и codemod через AST, по разделам с упражнениями. По подписке Frontend Masters. Редкий случай, когда на узкую тему есть прямой курс.'
  },

  // --- CSS и вёрстка (область вне vault) ---
  {
    id: 'comeau-css-for-js',
    title: 'CSS for JavaScript Developers',
    author: 'Josh W. Comeau',
    platform: 'css-for-js.dev',
    url: 'https://css-for-js.dev/',
    hours: 40,
    level: 'intermediate',
    access: 'paid',
    updated: 'актуален',
    topics: [],
    areas: ['css'],
    why: 'Для тех, кто пишет JS, но CSS «по наитию»: рендеринг, позиционирование, flexbox, grid, stacking context. Интерактивно, с мини-играми. Закрывает пробел, который у большинства фронтендеров есть.'
  },
  {
    id: 'powell-responsive',
    title: 'Conquering Responsive Layouts',
    author: 'Kevin Powell',
    platform: 'courses.kevinpowell.co',
    url: 'https://courses.kevinpowell.co/conquering-responsive-layouts',
    level: 'beginner',
    access: 'free',
    updated: 'актуален',
    topics: [],
    areas: ['css'],
    why: 'Бесплатный 21-дневный челлендж по адаптивной вёрстке от «короля CSS». Маленькие видео + практика по макетам. Хороший быстрый старт, если CSS проседает, без вложений.'
  },

  // --- Тестирование (область вне vault) ---
  {
    id: 'dodds-testing-js',
    title: 'Testing JavaScript',
    author: 'Kent C. Dodds',
    platform: 'testingjavascript.com',
    url: 'https://www.testingjavascript.com/',
    level: 'intermediate→advanced',
    access: 'paid',
    updated: 'актуален',
    topics: [],
    areas: ['testing'],
    why: 'Полный курс по тестированию: от основ до React Testing Library и e2e. Автор RTL и идеи «testing trophy». Тестирование почти не покрыто в твоих заметках, а на собесах и в проде спрашивают.'
  },

  // --- Next.js (область вне vault) ---
  {
    id: 'max-nextjs',
    title: 'Next.js & React - The Complete Guide',
    author: 'Maximilian Schwarzmüller',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/',
    hours: 68,
    level: 'beginner→advanced',
    access: 'paid',
    updated: 'январь 2026 (Next.js 15, App Router)',
    topics: [],
    areas: ['nextjs'],
    why: 'Самый полный путь по Next.js: App Router и Pages Router, серверные/клиентские компоненты, server actions, паттерны выборки данных. 4.7, обновлён в 2026. Логичный шаг после базового React.'
  },

  // --- Производительность (область вне vault) ---
  {
    id: 'kinney-js-performance',
    title: 'JavaScript Performance',
    author: 'Steve Kinney',
    platform: 'Frontend Masters',
    url: 'https://frontendmasters.com/courses/web-performance/',
    hours: 5,
    level: 'intermediate',
    access: 'subscription',
    updated: 'актуальна',
    topics: [],
    areas: ['web-perf'],
    why: 'Три слоя производительности: сеть, исполнение JS, рендеринг. Объясняет, как браузер парсит и рисует код. Меняет то, как мыслишь о скорости, а не только набор трюков.'
  },
  {
    id: 'kinney-react-performance',
    title: 'React Performance',
    author: 'Steve Kinney',
    platform: 'Frontend Masters',
    url: 'https://frontendmasters.com/courses/react-performance/',
    level: 'intermediate→advanced',
    access: 'subscription',
    updated: 'включает React 19',
    topics: [],
    areas: ['web-perf'],
    why: 'Прицельно React: reconciliation и ре-рендеры, мемоизация, code splitting, конкурентные фичи React 19. Бери после JavaScript Performance, когда тормозит именно React-приложение.'
  },

  // --- Доступность (область вне vault) ---
  {
    id: 'webdev-a11y',
    title: 'Learn Accessibility',
    author: 'web.dev (Google)',
    platform: 'web.dev',
    url: 'https://web.dev/learn/accessibility',
    level: 'beginner→intermediate',
    access: 'free',
    updated: 'evergreen',
    topics: [],
    areas: ['a11y'],
    why: 'Бесплатный структурный курс от Google: семантика, клавиатура, ARIA, контраст, формы. Лучшая бесплатная точка входа в a11y, без вложений и регистрации.'
  },
  {
    id: 'kuperman-a11y',
    title: 'Website Accessibility, v3',
    author: 'Jon Kuperman',
    platform: 'Frontend Masters',
    url: 'https://frontendmasters.com/courses/accessibility-v3/',
    hours: 2.3,
    level: 'beginner→intermediate',
    access: 'subscription',
    updated: 'v3, март 2025',
    topics: [],
    areas: ['a11y'],
    why: 'Практическая основа за 2 часа: семантический HTML, ARIA-роли, управление фокусом и tab-trapping, контраст, аудит (Lighthouse, Axe). 4.8. Бери, если после бесплатного web.dev хочешь разобрать руками с преподавателем.'
  }
]

/** Курсы каталога, покрывающие тему (по relativePath заметки). Связь курс↔тема. */
export function coursesForTopic(relativePath: string): Course[] {
  return COURSES.filter((c) => c.topics.includes(relativePath))
}

/** Курсы каталога по общей области фронтенда (CSS, тестирование, ...). */
export function coursesForArea(areaId: string): Course[] {
  return COURSES.filter((c) => c.areas?.includes(areaId))
}
