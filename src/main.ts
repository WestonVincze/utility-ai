import './style.css'

/** UTILITY AI */
class UtilityAI<TContext> {
  #context: TContext;
  updatePeriod: number;

  #rootReasoner: Reasoner<TContext>;

  constructor(context: TContext, reasoner: Reasoner<TContext>, updatePeriod = 1) {
    this.#context = context;
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
interface Reasoner<TContext> {
  considerations: Consideration<TContext>[];
  select: (context: TContext) => Action<TContext> | null;
  addConsideration: (consideration: Consideration<TContext>) => void
  selectBestConsideration: (context: TContext) => Consideration<TContext> | null;
  // default consideration + addDefaultConsideration?
}


/**
 * CONSIDERATIONS - SUB 
 * * contains a list of APPRAISALS and ACTIONS
 * * calculates the score which represents numerically the utility of its ACTION
 */ 
interface Consideration<TContext> {
  action: Action<TContext>;
  score: number;
  appraisals?: Appraisal<TContext>[];
}

/**
 * APPRAISALS
 * * the calculated Utility
 * * * https://www.desmos.com/calculator
 */
interface Appraisal<TContext> {
  getScore: (context: TContext) => number;
}

/**
 * ACTIONS
 */
interface Action<TContext> {
  name: string;
  execute: (context: TContext) => void;
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
  allies: ContextualUnitData[],
  enemies: ContextualUnitData[],
}


// build actions

class FleeAction implements Action<Context> {
  name = "Flee";

  execute(context: Context): void {
    // fleeing
  }
}

// build appraisals

// place action / appraisal combinations into considerations

// place considerations into reasoner

/**
 * http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf
 * The key to understanding Utility theory is to understand the relationship between the input and the output, and being able to describe that resulting curve. Think of it as a "conversion process"
 * * linear
 * * quadratic 
 * * piecewise linear curves
 * 
 * Inertia:
 * * a solution to the "oscillation" problem (AI rapidly switching between actions)
 * * Possible solutions:
 * * * add weight to any action that is already engaged
 * * * cooldowns - apply a strong weight once a decision has been made that can drop off over time
 * * * stall the decision making system (time based or until action is completed)
 */