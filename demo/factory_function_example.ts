enum ActionName {
  Idle,
  Attack,
  Flee
}

export interface Action {
  name: string | number;
  parameters?: Record<string, any>;
}

export type Context = Record<string, any>;

// we may want to have additional (and optional) appraisal params
export type AppraisalFunction = (context: Context) => number;

export type ScoringFunction = (scores: number[]) => number;

export type CurveFunction = (score: number) => number;

export interface Appraisal {
  evaluate: AppraisalFunction;
  computeCurve?: CurveFunction
}

export interface Consideration {
  action: Action;
  bonusFactor: number;
  weight: number;
  appraisals: Appraisal[];
  scoringMethod: ScoringFunction;
  parameters?: Record<string, any>;
}

export interface Reasoner {
  considerations: Consideration[];
  evaluate: (context: Context) => Action;
}

// Helper functions
export const createAppraisal = (
  fn: AppraisalFunction,
  computeCurve?: CurveFunction,
): Appraisal => ({
  evaluate: fn,
  computeCurve: computeCurve || quadraticCurve,
});

export const createConsideration = (
  action: Action,
  appraisals: Appraisal[],
  scoringMethod: ScoringFunction,
  bonusFactor?: number,
  weight?: number,
  parameters?: Record<string, any>,
): Consideration => ({
  action,
  appraisals,
  scoringMethod,
  bonusFactor: bonusFactor || 1,
  weight: weight || 1,
  parameters,
});

export const createReasoner = (considerations: Consideration[]): Reasoner => {
  return {
    considerations,
    evaluate: (context: Context) => {
      let bestScore = -Infinity;
      let bestAction: Action | null = null;

      for (const consideration of considerations) {
        if (consideration.weight <= 0) continue;

        const scores = [] as number[];

        for (const appraisal of consideration.appraisals) {
          const score = appraisal.evaluate(context);
          if (score === 0) continue;
          scores.push(score);
        }

        const score = consideration.scoringMethod(scores) * consideration.weight;
        if (score > bestScore) {
          bestScore = score;
          bestAction = consideration.action;
        }
      }

      return bestAction || { name: ActionName.Idle };
    },
  }
};

/*
const ScoreAllConsiderations = (considerations: Consideration[], context: Context) => {
  let cutoff = 0;
  for (const consideration of considerations) {
    const bonus = consideration.bonusFactor;
    if (bonus < cutoff) continue;
  }
}
*/

// Example scoring methods
export const averageScoring: ScoringFunction = (scores) => 
  scores.reduce((sum, score) => sum + score, 0) / scores.length;

export const multiplicativeScoring: ScoringFunction = (scores) => 
  scores.reduce((product, score) => product * score, 1);

// Example curve functions
export const linearCurve: CurveFunction = (score) => score;
export const quadraticCurve: CurveFunction = (score) => score * score;

// Example usage
const exampleContext: Context = {
  health: 0.5,
  enemyDistance: 10,
  ammo: 20,
};

const healthAppraisal = createAppraisal((context) => 1 - context.health, quadraticCurve);
const distanceAppraisal = createAppraisal((context) => 1 / (1 + context.enemyDistance));

const attackConsideration = createConsideration(
  { name: ActionName.Attack, parameters: { targetId: 1 } },
  [healthAppraisal, distanceAppraisal],
  averageScoring,
);

const reasoner = createReasoner([attackConsideration]);
const result = reasoner.evaluate(exampleContext);

console.log(result); // { name: "attack", parameters: { targetId: 1 } }