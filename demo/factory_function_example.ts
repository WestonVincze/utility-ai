enum ActionName {
  Idle,
  Attack,
  Flee
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

export const createReasoner = (baseConsiderations: Consideration[]): Reasoner => {
  return {
    considerations: baseConsiderations,
    evaluate: (context: Context, dynamicConsiderations: Consideration[] = []) => {
      let bestScore = -Infinity;
      let bestAction: Action | null = null;

      for (const consideration of [
        ...baseConsiderations,
        ...dynamicConsiderations
      ]) {
        if (consideration.weight <= 0) continue;

        const scores = [] as number[];

        for (const appraisal of consideration.appraisals) {
          const score = appraisal.evaluate({
            ...context,
            ...consideration.parameters
          });
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
export const inverseQuadraticCurve: CurveFunction = (score) => 1 - score * score;
