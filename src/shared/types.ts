// Общие типы дерева навыков. Делятся между main (парсинг/запись) и renderer (отрисовка).

/** Под-навык: имя + уровень 0-10. */
export interface Skill {
  name: string
  level: number
}

/** Тема = одна заметка .md внутри домена. */
export interface Topic {
  title: string
  domain: string
  /** Путь под vault — идентификатор для записи обратно. */
  relativePath: string
  /** Существующее поле solid/learning, пробрасывается как есть. */
  status?: string
  skills: Skill[]
  /** Производное: среднее уровней навыков (0-10), 0 если навыков нет. */
  level: number
}

/** Домен = папка в 10-knowledge/. */
export interface Domain {
  name: string
  topics: Topic[]
  /** Производное: среднее уровней тем. */
  level: number
}

/** Снимок состояния vault для renderer: путь к базе знаний и собранное дерево. */
export interface VaultState {
  /** Путь к папке базы знаний, либо null, если ещё не выбран. */
  path: string | null
  tree: Domain[]
}

/** Аргументы записи уровня одного навыка обратно в заметку. */
export interface SetLevelArgs {
  /** Путь заметки под базой знаний (как в Topic.relativePath). */
  relativePath: string
  skillName: string
  /** Новый уровень 0-10. */
  level: number
}
