'use client'

import { useState } from 'react'

export default function SettingsPage() {
  // GLOBAL SETTINGS
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [buttonColor, setButtonColor] = useState('orange')
  const [pushNotif, setPushNotif] = useState(true)
  const [mailNotif, setMailNotif] = useState(false)
  const [animations, setAnimations] = useState(true)
  const [displayMode, setDisplayMode] = useState<'normal' | 'compact'>('normal')
  const [language, setLanguage] = useState('fr')

  const cardClass =
    'rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-200'

  const toggle = (value: boolean, setter: (v: boolean) => void) => setter(!value)

  return (
    <main className="main-shell px-4 py-6 md:px-0">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        {/* HEADER */}
        <header>
          <h1 className="text-xl font-semibold text-slate-50">Paramètres généraux</h1>
          <p className="text-xs text-slate-400">
            Personnalisez votre expérience globale sur CineVerse.
          </p>
        </header>

        {/* APPEARANCE */}
        <section className={cardClass}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Apparence
          </h2>

          {/* THEME */}
          <div className="flex items-center justify-between py-2">
            <span>Mode d'affichage</span>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  theme === 'light'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Clair
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Sombre
              </button>
            </div>
          </div>

          {/* BUTTON COLOR */}
          <div className="flex items-center justify-between py-2">
            <span>Couleur des boutons</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
            >
              <option value="orange">Orange</option>
              <option value="blue">Bleu</option>
              <option value="green">Vert</option>
              <option value="purple">Violet</option>
            </select>
          </div>

          {/* DISPLAY MODE */}
          <div className="flex items-center justify-between py-2">
            <span>Mode d'affichage des listes</span>
            <div className="flex gap-3">
              <button
                onClick={() => setDisplayMode('normal')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  displayMode === 'normal'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setDisplayMode('compact')}
                className={`px-3 py-1 rounded-lg text-xs ${
                  displayMode === 'compact'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className={cardClass}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notifications
          </h2>

          <div className="flex items-center justify-between py-2">
            <span>Notifications push</span>
            <button
              onClick={() => toggle(pushNotif, setPushNotif)}
              className={`px-4 py-1 rounded-lg text-xs ${
                pushNotif ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {pushNotif ? 'Activées' : 'Désactivées'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Notifications email</span>
            <button
              onClick={() => toggle(mailNotif, setMailNotif)}
              className={`px-4 py-1 rounded-lg text-xs ${
                mailNotif ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {mailNotif ? 'Activées' : 'Désactivées'}
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
              {animations ? 'Activées' : 'Désactivées'}
            </button>
          </div>
        </section>

        {/* LANGUAGE */}
        <section className={cardClass}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Langue
          </h2>

          <select
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </section>
      </div>
    </main>
  )
}
