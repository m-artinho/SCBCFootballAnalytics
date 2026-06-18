// Static mock squad (24, all positions) + market pool (24, GK/DEF/ST only).
// Raw metric values are authored in benchmark-relative ranges so a few players
// clearly stand out and a few clearly lag — the demo needs visible signal (§9).
//
// `raw` is ordered to match POSITION_METRICS[position]:
//   ST      [npxG, xA, npG, SCA, aerial%, pressF3]
//   DEF     [tk+int, aerial%, blk+clr, progPass, pass%, errors→shot]
//   GK      [gsaa, save%, claim%, pass%, sweeper, goalsPrev]
//   generic [progAct, xG+xA, pass%, defAct, duels%]   (MID / FB / WING)

import { Player } from './types'
import { buildPlayer, PlayerSpec } from '../lib/scoring'

const HOME = 'Atlético Mondego FC'

// ── Squad (owned players) ────────────────────────────────────────────────
const SQUAD_SPECS: PlayerSpec[] = [
  // Goalkeepers (3)
  { id: 'sq-gk-1', name: 'Tiago Sequeira', club: HOME, position: 'GK', age: 29, marketValue: 8_000_000, raw: [0.24, 76, 95, 84, 1.9, 0.22] },
  { id: 'sq-gk-2', name: 'Bruno Alvarenga', club: HOME, position: 'GK', age: 25, marketValue: 3_500_000, raw: [0.04, 69, 90, 80, 1.4, 0.05] },
  { id: 'sq-gk-3', name: 'Hélder Quaresma', club: HOME, position: 'GK', age: 33, marketValue: 900_000, raw: [-0.08, 65, 87, 73, 0.9, -0.05] },

  // Centre-backs (5)
  { id: 'sq-def-1', name: 'Diogo Vasconcelos', club: HOME, position: 'DEF', age: 26, marketValue: 14_000_000, raw: [4.6, 73, 6.5, 7.5, 92.5, 0.05] },
  { id: 'sq-def-2', name: 'Nuno Carvalho', club: HOME, position: 'DEF', age: 30, marketValue: 6_000_000, raw: [4.2, 76, 7.4, 3.2, 82, 0.1] },
  { id: 'sq-def-3', name: 'Márcio Lobo', club: HOME, position: 'DEF', age: 28, marketValue: 4_500_000, raw: [3.4, 62, 5.1, 4.8, 86, 0.12] },
  { id: 'sq-def-4', name: 'Eduardo Pinto', club: HOME, position: 'DEF', age: 21, marketValue: 2_000_000, raw: [2.7, 54, 4.0, 5.2, 85, 0.22] },
  { id: 'sq-def-5', name: 'Sérgio Fontes', club: HOME, position: 'DEF', age: 32, marketValue: 1_800_000, raw: [3.0, 58, 5.5, 4.0, 88, 0.15] },

  // Full-backs (4)
  { id: 'sq-fb-1', name: 'Rafael Coutada', club: HOME, position: 'FB', age: 24, marketValue: 9_000_000, raw: [9.0, 0.4, 90, 7.2, 60] },
  { id: 'sq-fb-2', name: 'André Salgado', club: HOME, position: 'FB', age: 27, marketValue: 4_000_000, raw: [6.0, 0.22, 87, 6.5, 53] },
  { id: 'sq-fb-3', name: 'Paulo Mendonça', club: HOME, position: 'FB', age: 29, marketValue: 2_800_000, raw: [4.0, 0.12, 84, 8.5, 58] },
  { id: 'sq-fb-4', name: 'Vítor Andrade', club: HOME, position: 'FB', age: 23, marketValue: 1_500_000, raw: [4.2, 0.14, 82, 5.0, 47] },

  // Midfielders (5)
  { id: 'sq-mid-1', name: 'Gonçalo Ferreira', club: HOME, position: 'MID', age: 25, marketValue: 16_000_000, raw: [9.3, 0.45, 92, 6.8, 56] },
  { id: 'sq-mid-2', name: 'Miguel Tavares', club: HOME, position: 'MID', age: 27, marketValue: 7_000_000, raw: [7.0, 0.3, 88, 7.8, 58] },
  { id: 'sq-mid-3', name: 'Hugo Barreto', club: HOME, position: 'MID', age: 30, marketValue: 4_500_000, raw: [5.8, 0.18, 90, 8.0, 54] },
  { id: 'sq-mid-4', name: 'Tomás Real', club: HOME, position: 'MID', age: 20, marketValue: 2_500_000, raw: [4.5, 0.16, 83, 5.2, 46] },
  { id: 'sq-mid-5', name: 'Iván Mboma', club: HOME, position: 'MID', age: 28, marketValue: 2_200_000, raw: [4.8, 0.14, 85, 6.0, 50] },

  // Wingers (4)
  { id: 'sq-wing-1', name: 'Joel Nascimento', club: HOME, position: 'WING', age: 23, marketValue: 18_000_000, raw: [9.4, 0.47, 86, 5.0, 58] },
  { id: 'sq-wing-2', name: 'Kevin Osei', club: HOME, position: 'WING', age: 25, marketValue: 8_000_000, raw: [7.5, 0.33, 85, 5.5, 55] },
  { id: 'sq-wing-3', name: 'Bruno Lemos', club: HOME, position: 'WING', age: 27, marketValue: 4_000_000, raw: [6.0, 0.24, 87, 7.5, 56] },
  { id: 'sq-wing-4', name: 'Dário Pires', club: HOME, position: 'WING', age: 22, marketValue: 2_000_000, raw: [4.6, 0.17, 82, 4.5, 45] },

  // Strikers (3)
  { id: 'sq-st-1', name: 'Leonardo Brandão', club: HOME, position: 'ST', age: 26, marketValue: 22_000_000, raw: [0.55, 0.26, 0.58, 4.4, 64, 6.0] },
  { id: 'sq-st-2', name: 'Salomão Dias', club: HOME, position: 'ST', age: 28, marketValue: 9_000_000, raw: [0.5, 0.1, 0.52, 2.4, 60, 4.0] },
  { id: 'sq-st-3', name: 'Wilson Katembo', club: HOME, position: 'ST', age: 20, marketValue: 5_000_000, raw: [0.28, 0.15, 0.26, 3.0, 50, 7.0] },
]

// ── Market (scouting pool) — GK / DEF / ST only, deep on three positions ──
const MARKET_SPECS: PlayerSpec[] = [
  // Goalkeepers (8)
  { id: 'mk-gk-1', name: 'Octávio Reis', club: 'Vila Real SC', position: 'GK', age: 27, marketValue: 12_000_000, raw: [0.26, 76.5, 96, 86, 2.0, 0.23] },
  { id: 'mk-gk-2', name: 'Cláudio Bingham', club: 'Coimbra United', position: 'GK', age: 24, marketValue: 7_000_000, raw: [0.2, 74, 94, 83, 1.8, 0.18] },
  { id: 'mk-gk-3', name: 'Nélson Faria', club: 'Rio Lima FC', position: 'GK', age: 30, marketValue: 4_000_000, raw: [0.08, 71, 92, 80, 1.5, 0.09] },
  { id: 'mk-gk-4', name: 'Aristides Gomes', club: 'Setúbal Athletic', position: 'GK', age: 22, marketValue: 5_500_000, raw: [0.1, 70, 90, 87, 2.3, 0.1] },
  { id: 'mk-gk-5', name: 'Domingos Sá', club: 'Porto Novo CF', position: 'GK', age: 33, marketValue: 1_500_000, raw: [-0.06, 66, 88, 75, 1.0, -0.02] },
  { id: 'mk-gk-6', name: 'Henrique Vás', club: 'Braga Sul', position: 'GK', age: 26, marketValue: 6_000_000, raw: [0.02, 68, 89, 78, 1.2, 0.03] },
  { id: 'mk-gk-7', name: 'Mateus Lindo', club: 'Faro Marítimo', position: 'GK', age: 28, marketValue: 3_000_000, raw: [0.19, 74.5, 91, 72, 0.9, 0.17] },
  { id: 'mk-gk-8', name: 'Yannick Dabo', club: 'Aveiro City', position: 'GK', age: 23, marketValue: 2_000_000, raw: [-0.02, 67, 86, 79, 1.6, 0.0] },

  // Centre-backs (8)
  { id: 'mk-def-1', name: 'Cristiano Banza', club: 'Guimarães Rovers', position: 'DEF', age: 25, marketValue: 20_000_000, raw: [4.8, 75, 7.3, 7.8, 93, 0.05] },
  { id: 'mk-def-2', name: 'Aldair Moniz', club: 'Leiria FC', position: 'DEF', age: 23, marketValue: 9_000_000, raw: [4.4, 71, 6.8, 6.5, 90, 0.07] },
  { id: 'mk-def-3', name: 'Ivo Cabral', club: 'Évora CD', position: 'DEF', age: 28, marketValue: 6_000_000, raw: [3.8, 76, 7.6, 3.5, 84, 0.11] },
  { id: 'mk-def-4', name: 'Paulinho Tembe', club: 'Funchal Atlântico', position: 'DEF', age: 26, marketValue: 8_000_000, raw: [3.6, 55, 4.5, 7.6, 92.5, 0.13] },
  { id: 'mk-def-5', name: 'Rúben Mascarenhas', club: 'Vila Real SC', position: 'DEF', age: 30, marketValue: 4_000_000, raw: [3.5, 64, 5.3, 4.8, 87, 0.12] },
  { id: 'mk-def-6', name: 'Garry Owusu', club: 'Coimbra United', position: 'DEF', age: 21, marketValue: 7_000_000, raw: [3.0, 60, 4.8, 5.0, 83, 0.2] },
  { id: 'mk-def-7', name: 'Telmo Ribeiro', club: 'Rio Lima FC', position: 'DEF', age: 33, marketValue: 1_500_000, raw: [2.8, 57, 4.4, 3.2, 85, 0.18] },
  { id: 'mk-def-8', name: 'Kwame Asante', club: 'Setúbal Athletic', position: 'DEF', age: 24, marketValue: 5_000_000, raw: [4.0, 67, 6.0, 5.5, 88, 0.1] },

  // Strikers (8)
  { id: 'mk-st-1', name: 'Ângelo Rufino', club: 'Porto Novo CF', position: 'ST', age: 24, marketValue: 28_000_000, raw: [0.6, 0.28, 0.62, 4.6, 60, 6.5] },
  { id: 'mk-st-2', name: 'Bakary Sané', club: 'Braga Sul', position: 'ST', age: 22, marketValue: 15_000_000, raw: [0.52, 0.24, 0.55, 4.0, 66, 7.0] },
  { id: 'mk-st-3', name: 'Renato Quim', club: 'Faro Marítimo', position: 'ST', age: 27, marketValue: 10_000_000, raw: [0.38, 0.32, 0.36, 5.0, 48, 7.5] },
  { id: 'mk-st-4', name: 'Jonas Vidigal', club: 'Aveiro City', position: 'ST', age: 29, marketValue: 7_000_000, raw: [0.54, 0.09, 0.56, 2.3, 58, 3.8] },
  { id: 'mk-st-5', name: 'Sandro Effenberg', club: 'Guimarães Rovers', position: 'ST', age: 31, marketValue: 4_000_000, raw: [0.34, 0.11, 0.3, 2.6, 68, 4.2] },
  { id: 'mk-st-6', name: 'Lúcio Pereira', club: 'Leiria FC', position: 'ST', age: 20, marketValue: 6_000_000, raw: [0.4, 0.19, 0.38, 3.5, 52, 6.8] },
  { id: 'mk-st-7', name: 'Moussa Traoré', club: 'Évora CD', position: 'ST', age: 26, marketValue: 9_000_000, raw: [0.33, 0.14, 0.32, 3.0, 53, 5.0] },
  { id: 'mk-st-8', name: 'Diego Fortes', club: 'Funchal Atlântico', position: 'ST', age: 23, marketValue: 5_000_000, raw: [0.26, 0.13, 0.24, 2.8, 50, 5.6] },
]

export const players: Player[] = [
  ...SQUAD_SPECS.map((s) => buildPlayer(s, 'squad')),
  ...MARKET_SPECS.map((s) => buildPlayer(s, 'market')),
]

export const squadPlayers: Player[] = players.filter((p) => p.type === 'squad')
export const marketPlayers: Player[] = players.filter((p) => p.type === 'market')

export function getPlayer(id: string): Player | undefined {
  return players.find((p) => p.id === id)
}
