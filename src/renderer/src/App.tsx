import { useEffect, useState } from 'react'
import type { VaultState } from '../../shared/types'

export function App() {
  const [state, setState] = useState<VaultState | null>(null)

  useEffect(() => {
    window.api.getState().then(setState)
  }, [])

  async function choose() {
    setState(await window.api.chooseVault())
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
                      <li key={skill.name}>
                        {skill.name}: {skill.level}/10
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
