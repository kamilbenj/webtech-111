'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [buttonColor, setButtonColor] = useState('orange')
  const [pushNotif, setPushNotif] = useState(true)
  const [mailNotif, setMailNotif] = useState(false)
  const [animations, setAnimations] = useState(true)

  const cardClass =
    'rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-200'

  const toggle = (value: boolean, setter: (v: boolean) => void) => setter(!value)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-button', buttonColor)
  }, [theme, buttonColor])

  return (
    <main className="main-shell px-4 py-6 md:px-0">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold text-slate-50">General settings</h1>
          <p className="text-xs text-slate-400">
            Customize your global experience on CineVerse.
          </p>
        </header>

        <section className={cardClass}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Appearance
          </h2>

          <div className="flex items-center justify-between py-2">
            <span>Theme</span>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  theme === 'light'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Button color</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
            >
              <option value="orange">Orange</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notifications
          </h2>

          <div className="flex items-center justify-between py-2">
            <span>Push notifications</span>
            <button
              onClick={() => toggle(pushNotif, setPushNotif)}
              className={`px-4 py-1 rounded-lg text-xs ${
                pushNotif ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {pushNotif ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Email notifications</span>
            <button
              onClick={() => toggle(mailNotif, setMailNotif)}
              className={`px-4 py-1 rounded-lg text-xs ${
                mailNotif ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {mailNotif ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Animations</span>
            <button
              onClick={() => toggle(animations, setAnimations)}
              className={`px-4 py-1 rounded-lg text-xs ${
                animations ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {animations ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}