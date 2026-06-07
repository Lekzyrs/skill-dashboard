import { useEffect, useState } from 'react'
import type { VaultState } from '../../shared/types'
import { Overview } from './components/Overview'
import { DomainDetail } from './components/DomainDetail'
import styles from './App.module.css'

type View = { kind: 'overview' } | { kind: 'domain'; name: string }

export function App() {
  const [state, setState] = useState<VaultState | null>(null)
  const [view, setView] = useState<View>({ kind: 'overview' })
  // Пока запись уровня в полёте — блокируем шкалы (анти-гонка быстрых кликов).
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.api.getState().then(setState)
    return window.api.onVaultChanged(setState)
  }, [])

  async function choose() {
    setState(await window.api.chooseVault())
    setView({ kind: 'overview' })
  }

  async function setLevel(relativePath: string, skillName: string, level: number) {
    setBusy(true)
    try {
      setState(await window.api.setLevel({ relativePath, skillName, level }))
    } finally {
      setBusy(false)
    }
  }

  if (!state) {
    return (
      <div className={styles.app}>
        <div className={styles.center}>
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
        </div>
      </div>
    )
  }

  if (!state.path) {
    return (
      <div className={styles.app}>
        <div className={styles.center}>
          <h1 className={styles.welcomeTitle}>Навыки</h1>
          <p className={styles.welcomeText}>База знаний пока не выбрана.</p>
          <button type="button" className={styles.primary} onClick={choose}>
            Выбрать папку базы знаний
          </button>
        </div>
      </div>
    )
  }

  const activeDomain =
    view.kind === 'domain' ? state.tree.find((d) => d.name === view.name) : undefined
  const viewKey = activeDomain ? `domain:${activeDomain.name}` : 'overview'

  return (
    <main className={styles.app}>
      <div key={viewKey} className={styles.view}>
        {state.tree.length === 0 ? (
          <div className={styles.center}>
            <p className={styles.welcomeText}>В этой папке не найдено доменных заметок.</p>
            <button type="button" className={styles.ghost} onClick={choose}>
              Сменить папку
            </button>
          </div>
        ) : activeDomain ? (
          <DomainDetail
            domain={activeDomain}
            busy={busy}
            onBack={() => setView({ kind: 'overview' })}
            onSetLevel={setLevel}
          />
        ) : (
          <Overview
            tree={state.tree}
            path={state.path}
            onOpenDomain={(name) => setView({ kind: 'domain', name })}
            onChoose={choose}
          />
        )}
      </div>
    </main>
  )
}
