const ATTRIBUTE_LABELS = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
}

function ResultBadge({ goal }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        goal ? 'bg-success-bg text-success' : 'bg-bg-muted text-text-muted'
      }`}
    >
      {goal ? 'Gol' : 'Sem gol'}
    </span>
  )
}

function DuelsSection({ title, duels }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
        {title}
      </h4>
      <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {[
                'Ordem',
                'Atacante',
                'Defensor',
                'Atributo (atk.)',
                'Valor (atk.)',
                'Atributo (def.)',
                'Valor (def.)',
                'Resultado',
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-muted"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {duels.map((duel) => (
              <tr
                key={duel.order}
                className={
                  duel.goal ? 'bg-success-bg/40' : 'hover:bg-bg-muted/50'
                }
              >
                <td className="px-3 py-2.5 text-text">{duel.order}</td>
                <td className="px-3 py-2.5 text-text">
                  {duel.attacker.player_name}
                </td>
                <td className="px-3 py-2.5 text-text">
                  {duel.defender.player_name}
                </td>
                <td className="px-3 py-2.5 text-text">
                  {ATTRIBUTE_LABELS[duel.attacker.attribute] ??
                    duel.attacker.attribute}
                </td>
                <td className="px-3 py-2.5 text-text">{duel.attacker.value}</td>
                <td className="px-3 py-2.5 text-text">
                  {ATTRIBUTE_LABELS[duel.defender.attribute] ??
                    duel.defender.attribute}
                </td>
                <td className="px-3 py-2.5 text-text">{duel.defender.value}</td>
                <td className="px-3 py-2.5">
                  <ResultBadge goal={duel.goal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Tabela de duelos de uma partida, dividida em duas seções — Ataques do
 * Mandante e Ataques do Visitante (roeirotela.md, 5.3 "Tabela de Duelos").
 * Mostra atacante, defensor, atributo e valor de ambos os lados, e o badge
 * de resultado (Gol/Sem gol).
 */
export function MatchDuels({ duels, homeClubId, homeClubName, awayClubName }) {
  const homeAttacks = duels.filter((d) => d.attacking_club_id === homeClubId)
  const awayAttacks = duels.filter((d) => d.attacking_club_id !== homeClubId)

  return (
    <div className="space-y-5">
      <DuelsSection
        title={`Ataques do Mandante — ${homeClubName}`}
        duels={homeAttacks}
      />
      <DuelsSection
        title={`Ataques do Visitante — ${awayClubName}`}
        duels={awayAttacks}
      />
    </div>
  )
}
