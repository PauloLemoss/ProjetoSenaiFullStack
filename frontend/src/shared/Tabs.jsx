/**
 * Navegação em abas dentro de uma página (roeirotela.md, 3.3 "Navegação
 * Interna — Tabs"), no mesmo estilo de pill já usado nas abas Todos/Livres/
 * Em clubes da lista de jogadores (frontend-design-system).
 */
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Navegação interna"
      className="inline-flex gap-1 p-1 rounded-full bg-bg-muted"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab.value
              ? 'bg-surface text-text shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
