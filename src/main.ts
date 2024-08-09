import './style.css'

/** UTILITY AI */
class UtilityAI<TContext, TPersonality> {
  updatePeriod: number;

  #rootReasoner: Reasoner<TContext, TPersonality>;

  constructor(context: TContext, reasoner: Reasoner<TContext, TPersonality>, updatePeriod = 1) {
    this.updatePeriod = updatePeriod;
    this.#rootReasoner = reasoner;
  }
}

/**
 * REASONERS - TOP LEVEL "ACTION"
 * * select CONSIDERATION from a list of CONSIDERATIONS
 * * * first score
 * * * highest score
 */ 
interface Reasoner<TContext, TPersonality> {
  considerations: Consideration<TContext, TPersonality>[],
  selectBestConsideration: (context: TContext) => Consideration<TContext, TPersonality> | null;

}

/**
 * CONSIDERATIONS - SUB 
 * * contains a list of APPRAISALS and ACTIONS
 * * calculates the score which represents numerically the utility of its ACTION
 */ 
interface Consideration<TContext, TPersonality> {
  // score: number;
  getScore: (context: TContext, personality: TPersonality) => number;
  action?: Action<TContext>;
  appraisals?: Appraisal<TContext, TPersonality>[];
}

/**
 * Score child appraisals until child scores below threshold
 */
class ThresholdConsideration<TContext, TPersonality> implements Consideration<TContext, TPersonality> {
  threshold: number;
  action?: Action<TContext>;
  appraisals?: Appraisal<TContext, TPersonality>[] | undefined;

  constructor(threshold: number, action: Action<TContext>, appraisals: Appraisal<TContext, TPersonality>[]) {
    this.action = action;
    this.appraisals = appraisals;
    this.threshold = threshold;
  }

  getScore = (context: TContext, personality: TPersonality) => {
    let sum = 0;
    this.appraisals?.forEach(appraisal => {
      const score = appraisal.getScore(context, personality);

      if (score < this.threshold) return sum;

      sum += score;
    })

    return sum;
  } 
}

/**
 * APPRAISALS
 * * the calculated Utility
 * * * https://www.desmos.com/calculator
 */
interface Appraisal<TContext, TPersonality> {
  weight: number
  getScore: (context: TContext, personality: TPersonality) => number;
}

/**
 * ACTIONS
 */
interface Action<TContext> {
  name: string;
  execute: (context?: TContext) => void;
}

/**
 * AGENT
 * * context
 * * personality
 * * currentAction
 */
interface Agent<TContext> {
  name: string;
  currentAction: string | null;
  context: TContext
}

type ContextualUnitData = {
  distance: number,
  health: number,
  power: number
}

// implement game state / context
type Context = {
  health: number,
  attackRange: number,
  moveSpeed: number,
  allies: ContextualUnitData[],
  enemies: ContextualUnitData[],
}


// build actions

class FleeAction implements Action<Context> {
  name = "Flee";

  execute(context?: Context): void {
    // fleeing
  }
}

/**
 * appraisal should have a weight, getScore, and 
 */

const enemiesNearby = () => {
  /** calculate value of avoiding enemies */
  // define what AI considers "close"
  // get the number of enemies within "close" range and LoS
  // return number based on "fearfulness"
}

const healthRemaining = () => {
  // define the flee threshold
  // get the remaining health (percentage)
  // return calculation of remaining health * flee threshold
}

const alliesNearby = () => {
  /** calculate value of retreating to allies */
  // check for a "cluster" of allies within "range"
  // 
}

class EatAction implements Action<Context> {
  name = "Eat";

  execute(context?: Context): void {
    // eating 
  }
}

class DrinkAction implements Action<Context> {
  name = "Drink";

  execute(context?: Context): void {
    // drinking 
  }
}

// build appraisals

// place action / appraisal combinations into considerations

// place considerations into reasoner
