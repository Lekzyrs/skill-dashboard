import { useEffect, useState } from 'react'

export function App() {
  const [pong, setPong] = useState('...')

  useEffect(() => {
    window.api.ping().then(setPong)
  }, [])

  return (
    <main>
      <h1>Skill Dashboard</h1>
      <p>Каркас работает. Ответ моста IPC: {pong}</p>
    </main>
  )
}
