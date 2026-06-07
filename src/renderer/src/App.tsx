import { useEffect, useState } from 'react'
import type { Skill, VaultState } from '../../shared/types'

export function App() {
  const [state, setState] = useState<VaultState | null>(null)
  // Пока запись уровня в полёте — блокируем степперы, чтобы быстрые клики
  // не считали ±1 от устаревшего уровня и не перетирали друг друга.
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.api.getState().then(setState)
  }, [])

  async function choose() {
    setState(await window.api.chooseVault())
  }

  async function changeLevel(relativePath: string, skill: Skill, delta: number) {
    const next = skill.level + delta
    if (next < 0 || next > 10) return
    setBusy(true)
    try {
      setState(await window.api.setLevel({ relativePath, skillName: skill.name, level: next }))
    } finally {
      setBusy(false)
    }
  }

  if (!state) {
    return (
      <main>
        <p>Загрузка…</p>
      </main>
    )
  }

  if (!state.path) {
    return (
      <main>
        <h1>Skill Dashboard</h1>
        <p>База знаний пока не выбрана.</p>
        <button onClick={choose}>Выбрать папку базы знаний</button>
      </main>
    )
  }

  return (
    <main>
      <header>
        <h1>Навыки</h1>
        <p className="path">{state.path}</p>
        <button onClick={choose}>Сменить папку</button>
      </header>

      {state.tree.length === 0 ? (
        <p>В этой папке не найдено доменных заметок.</p>
      ) : (
        state.tree.map((domain) => (
          <section key={domain.name}>
            <h2>
              {domain.name} · {domain.level}/10
            </h2>
            {domain.topics.map((topic) => (
              <article key={topic.relativePath}>
                <h3>
                  {topic.title} · {topic.level}/10
                </h3>
                {topic.skills.length > 0 && (
                  <ul>
                    {topic.skills.map((skill) => (
                      <li key={skill.name} className="skill">
                        <span className="skill-name">{skill.name}</span>
                        <span className="stepper">
                          <button
                            type="button"
                            aria-label={`Понизить уровень: ${skill.name}`}
                            disabled={busy || skill.level <= 0}
                            onClick={() => changeLevel(topic.relativePath, skill, -1)}
                          >
                            −
                          </button>
                          <span className="skill-level">{skill.level}/10</span>
                          <button
                            type="button"
                            aria-label={`Повысить уровень: ${skill.name}`}
                            disabled={busy || skill.level >= 10}
                            onClick={() => changeLevel(topic.relativePath, skill, 1)}
                          >
                            +
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        ))
      )}
    </main>
  )
}
