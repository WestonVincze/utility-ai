// Types and interfaces
enum ActionName {
  Idle,
  Attack,
  Flee
}

interface Action {
  name: ActionName;
  parameters?: Record<string, any>;
}

type Context = Record<string, any>;

// we may want to have additional (and optional) appraisal params
type AppraisalFunction = (context: Context) => number;

type ScoringFunction = (scores: number[]) => number;

type CurveFunction = (score: number) => number;

interface Appraisal {
  evaluate: AppraisalFunction;
  computeCurve?: CurveFunction
}

interface Consideration {
  action: Action;
  weight: number;
  appraisals: Appraisal[];
  scoringMethod: ScoringFunction;
  parameters?: Record<string, any>;
}

interface Reasoner {
  considerations: Consideration[];
  evaluate: (context: Context) => Action;
}

// Helper functions
const createAppraisal = (
  fn: AppraisalFunction,
  computeCurve?: CurveFunction,
): Appraisal => ({
  evaluate: fn,
  computeCurve: computeCurve || quadraticCurve,
});

const createConsideration = (
  action: Action,
  appraisals: Appraisal[],
  scoringMethod: ScoringFunction,
  weight?: number,
  parameters?: Record<string, any>,
): Consideration => ({
  action,
  appraisals,
  scoringMethod,
  weight: weight || 1,
  parameters,
});

const createReasoner = (considerations: Consideration[]): Reasoner => ({
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
});

// Example scoring methods
const averageScoring: ScoringFunction = (scores) => 
  scores.reduce((sum, score) => sum + score, 0) / scores.length;

const multiplicativeScoring: ScoringFunction = (scores) => 
  scores.reduce((product, score) => product * score, 1);

// Example curve functions
const linearCurve: CurveFunction = (score) => score;
const quadraticCurve: CurveFunction = (score) => score * score;

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