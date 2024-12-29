export interface Action {
  name: string | number;
  parameters?: Record<string, any>;
}

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

export type Context = Record<string, any>;

// we may want to have additional (and optional) appraisal params
export type AppraisalFunction = (context: Context) => number;

export type ScoringFunction = (scores: number[]) => number;

export type CurveFunction = (score: number) => number;