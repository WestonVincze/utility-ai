interface Appraisal<TContext> {
  getScore: (context: TContext) => number;
  // curveType?
}

class Consideration<TContext> {
  weight: number;
  action: Action;
  params?: any;
  score = 0;
  bonus = 0;

  appraisals?: Appraisal<TContext>[];

  getScore(context: TContext) {
    if (!this.appraisals || this.appraisals.length === 0) return this.score;
    let finalScore = this.bonus;

    for (const appraisal of this.appraisals) {
      if (0 > finalScore) break;

      const utility = appraisal.getScore(context);
      if (utility === 0) return 0;

      finalScore *= utility
    }

    return finalScore;
  }
}

class Reasoner<TContext> {
  #considerations: Consideration<TContext>[];

  constructor(considerations?: Consideration<TContext>[]) {
    this.#considerations = considerations || [];
  }

  addConsideration (consideration: Consideration<TContext>) {
    this.#considerations.push(consideration);
  }

  removeConsiderationsWithAction(action: Action) { 
    this.#considerations = this.#considerations.filter(consideration => consideration.action !== action);
  }

  getBestAction(context: TContext) {
    let bestAction: Action | null = null;
    let highestUtility = -Infinity;

    for (const consideration of this.#considerations) {
      const utility = consideration.getScore(context) * consideration.weight;
      if (utility > highestUtility) {
        bestAction = consideration.action;
        highestUtility = utility;
      }
    }

    return bestAction;
  }
}

enum Action {
  Idle,
  MoveTo,
  Eat,
  Drink,
  Sleep,
  GatherFood,
  GatherWater,
}

/** constants */
const MAX_HUNGER = 100;
const MAX_THIRST = 100;
const MAX_ENERGY = 100;
const MAX_HEALTH = 10;

type ResourceData = {
  id: number,
  distance: number,
  value: number,
}

type Context = {
  hunger: number,
  health: number,
  thirst: number,
  energy: number,
  foodSources: ResourceData[],
  waterSources: ResourceData[],
  restSources: ResourceData[],
  availableFood: number;
  availableWater: number;
}

const autoUpdateContext = (context: Context) => {
  context.hunger += 1;
  context.thirst += 1;
  context.energy -= 1;
}

const AvailableFoodAppraisal: Appraisal<Context> = {
  getScore: (context: Context) => {
    if (context.availableFood === 0) return 0;
    return Math.min(context.availableFood / (MAX_HUNGER - context.hunger), 1);
  }
}

const HungerAppraisal: Appraisal<Context> = {
  // https://www.desmos.com/calculator/sdo7m9kpqp
  getScore: (context: Context) => {
    const w = context.hunger / MAX_HUNGER;
    const exponent = -(w * 12) + 6;
    const denominator = 1 + (Math.E * 2) ** exponent;
    return 1 - (1 / denominator);
  }
}

const GatherFoodAppraisal: Appraisal<Context> = {
  getScore: (context: Context) => {
    // if we have enough food to fill our hunger, value should be 0
    if (context.hunger + context.availableFood >= MAX_HUNGER) return 0;
    // if not, evaluate utility of food sources
    return 1;
  }
}

/*
const EatConsideration: Consideration<Context> = {
  weight: 1,
  action: Action.Eat,
  appraisals: [
    AvailableFoodAppraisal,
    HungerAppraisal,
  ],
  getScore: (context: Context) => Action.Drink
}
*/


const considerationTargetDistance = (context: Context) => {

}


// const AgentReasoner = new Reasoner<Context>();
