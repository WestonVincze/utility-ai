type Faction = "Red" | "Blue";

type Unit = {
  id: number,
  faction: Faction,
  health: number,
  maxHealth: number,
  attack: number,        // 1-10
  defense: number,       // 1-10
  position: Position
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
    health: 20,
    maxHealth: 20,
    canAttack: true,
    attack: 5,
    defense: 5,
    position: { x: 2, y: 2 }
  },
  {
    id: 2,
    faction: "Blue",
    health: 5,
    maxHealth: 5,
    attack: 5,
    defense: 5,
    position: { x: 5, y: 3 }
  },
  {
    faction: "Red",
    id: 3,
    health: 8,
    maxHealth: 8,
    attack: 3,
    defense: 3,
    position: { x: 1, y: 0 }
  },
  {
    faction: "Red",
    id: 4,
    health: 4,
    maxHealth: 8,
    attack: 3,
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

const considerationHealth = (id: number) => {
  const unit = getUnitById(id);
  if (!unit) return 0;
  return unit.health / unit.maxHealth;
}


const calculateDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }): number => {
  return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
};

const considerationTargetDistance = (id: number, targetId: number) => {
  const unit = getUnitById(id);
  const target = getUnitById(id);

  if (!unit || !target) return 0;

  const distance = calculateDistance(unit.position, target.position);

  return 0;
}

