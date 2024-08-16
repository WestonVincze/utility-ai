import { averageScoring, Consideration, Context, createAppraisal, createConsideration, createReasoner, quadraticCurve } from "./factory_function_example";

type Faction = "Red" | "Blue";

type Unit = {
  id: number,
  faction: Faction,
  currentHealth: number,
  maxHealth: number,
  accuracy: number,
  damage: number,
  defense: number,
  position: Position,
  canAttack?: boolean,
}

type GameState = {
  units: Unit[],
  grid: number[][],
}

type Position = {
  x: number,
  y: number
}

const units: Unit[] = [
  {
    id: 1,
    faction: "Blue",
    currentHealth: 20,
    maxHealth: 20,
    canAttack: true,
    accuracy: 75,
    damage: 5,
    defense: 5,
    position: { x: 2, y: 2 }
  },
  {
    id: 2,
    faction: "Blue",
    currentHealth: 5,
    maxHealth: 5,
    accuracy: 50,
    damage: 3,
    defense: 5,
    position: { x: 5, y: 3 }
  },
  {
    faction: "Red",
    id: 3,
    currentHealth: 8,
    maxHealth: 8,
    accuracy: 30,
    damage: 6,
    defense: 3,
    position: { x: 1, y: 0 }
  },
  {
    faction: "Red",
    id: 4,
    currentHealth: 4,
    maxHealth: 8,
    accuracy: 35,
    damage: 2,
    defense: 3,
    position: { x: 4, y: 0 }
  }
]

/**   0   1   2   3   4   5
 * 0 [ ] [E] [ ] [ ] [E] [ ]
 * 1 [ ] [ ] [ ] [ ] [ ] [ ]
 * 2 [ ] [ ] [A] [ ] [ ] [ ]
 * 3 [ ] [ ] [ ] [ ] [ ] [ ]
 * 4 [ ] [ ] [ ] [ ] [ ] [ ]
 * 5 [ ] [ ] [ ] [F] [ ] [ ]
 */

const getUnitById = (id: number) => {
  return units.find(unit => unit.id === id);
}

const context: Context = {
  targetId: 0,
  currentHealth: 0,
  maxHealth: 0,
  position: { x: 0, y: 0 },
  rangeMin: 1,
  rangeMax: 3,
  attackThreatMax: 1,
}


/** HELPERS */
const calculateDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;

  return Math.sqrt(dx**2 + dy**2);
};

const clamp = (value: number) => {
  return Math.min(Math.max(value, 0), 1);
}

const normalize = (value: number, min: number = 0, max: number = 1) => {
  return clamp((value - min) / (max - min));
}
/** END HELPERS */

const healthAppraisal = createAppraisal(context => context.currentHealth / context.maxHealth, quadraticCurve);

const targetHealthAppraisal = createAppraisal(context => {
  const target = getUnitById(context.target);
  if (!target) return 0;

  return target.currentHealth / target.maxHealth
}, quadraticCurve);

const targetDistanceAppraisal = createAppraisal(context => {
  const target = getUnitById(context.targetId);
  if (!target) return 0;

  const distance = calculateDistance(context.position, target.position);

  return normalize(distance, context.rangeMin, context.rangeMax);
});

const targetAttackThreatAppraisal = createAppraisal(context => {
  const target = getUnitById(context.targetId);

  if (!target) return 0;

  const normalizedHitChance = (target.accuracy - context.defense) / 100;
  const normalizedHitDamage = context.currentHealth / target.damage;

  return normalizedHitChance * 0.5 + normalizedHitDamage * 0.5;
});

const attackThreatAppraisal = createAppraisal(context => {
  const target = getUnitById(context.targetId);

  if (!target) return 0;

  const normalizedHitChance = (context.accuracy - target.defense) / 100;
  const normalizedHitDamage = target.currentHealth / context.damage;

  return normalizedHitChance * 0.5 + normalizedHitDamage * 0.5;
})

const attackConsideration = createConsideration(
  { name: "Attack" },
  [targetDistanceAppraisal, attackThreatAppraisal],
  averageScoring,
);

const fleeConsideration = createConsideration(
  { name: "Flee" },
  [healthAppraisal, targetAttackThreatAppraisal],
  averageScoring,
)

const reasoner = createReasoner([fleeConsideration]);

const generateDynamicConsiderations = (id: number) => {
  const agent = getUnitById(id);
  if (!agent) return;

  const enemies = units.filter(unit => unit.id !== id && unit.faction !== agent.faction);
  const allies = units.filter(unit => unit.id !== id && unit.faction === agent.faction);

  const considerations = [] as Consideration[];
  for (const enemy of enemies) {
    const consideration = createConsideration(
      { name: "Attack", parameters: { target: enemy.id }},
      [targetDistanceAppraisal, targetAttackThreatAppraisal],
      averageScoring
    );

    considerations.push(consideration);
  }

  for (const ally of allies) {
    const consideration = createConsideration(
      { name: "Help", parameters: { target: ally.id }},
      [targetDistanceAppraisal, targetHealthAppraisal],
      averageScoring
    );

    considerations.push(consideration);
  }

  return considerations;
}
