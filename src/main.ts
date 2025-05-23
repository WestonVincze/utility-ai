export type IContext = Record<string, any>;

export type ScoringFunction = (score: number[]) => number;

export type CurveFunction = (score: number) => number;

export interface IConsideration<TContext, TParams = undefined> {
  evaluate: (context: TContext, params?: TParams) => number;
  curveFunction?: CurveFunction;
} 

export interface IAppraisal<TContext> {
  id: string;
  action: { type: string; params?: Record<string, any> };
  considerations: {
    consideration: IConsideration<TContext, any>,
    params?: any
  }[],
  weight?: number;
  scoringFunction?: ScoringFunction;
}

/**
 * Reasoner is the main brain of the Utility AI process
 */
export class Reasoner<TContext extends IContext> {
  private appraisals: IAppraisal<TContext>[] = [];
  private lastAction: { type: string; parameters?: Record<string, any> } | null = null;
  private decisionLock: { isLocked: boolean; unlockTime: number } = { isLocked: false, unlockTime: 0 };

  private defaultScoringFunction: ScoringFunction;
  private defaultWeight: number;

  /**
   * @param appraisals initial appraisals - usually static and will always be checked
   * @param defaultScoringFunction the default scoring function that will be used if none is provided
   */
  constructor(appraisals?: IAppraisal<TContext>[], defaultScoringFunction?: ScoringFunction) {
    if (appraisals) this.appraisals = appraisals;

    this.defaultScoringFunction = defaultScoringFunction ?? ((scores: number[]) =>
      scores.reduce((prev, curr) => prev += curr, 0) / scores.length);

    this.defaultWeight = 1;
  }

  /**
   * Add a consideration to the reasoner
   */
  addAppraisal(appraisal: IAppraisal<TContext>): void {
    this.appraisals.push(appraisal);
  }
  
  /**
   * Remove a consideration to the reasoner
   */
  removeAppraisalById(id: string) {
    this.appraisals = this.appraisals.filter(
      consideration => consideration.id === id
    );
  }

  /**
   * Remove all considerations of a specific action type
   */
  removeAppraisalsByActionType(actionType: string) {
    this.appraisals = this.appraisals.filter(consideration => consideration.action.type !== actionType);
  }

  /**
   * Lock decisions for a specified duration (in seconds)
   */
  private lockDecision(duration: number) {
    this.decisionLock.isLocked = true;
    this.decisionLock.unlockTime = Date.now() + duration * 1000;
  }

  /**
   * Check if the decision lock is active
   */
  private isDecisionLocked(): boolean {
    if (this.decisionLock.isLocked && Date.now() < this.decisionLock.unlockTime) {
      return true;
    }

    this.decisionLock.isLocked = false;
    return false;
  }

  /**
   * @param context The context used by appraisals
   * @param dynamicAppraisals Optional additional appraisals
   * @returns 
   */
  getBestAction(
    context: TContext,
    dynamicAppraisals: IAppraisal<TContext>[] = []
  ): { type: string; parameters?: Record<string, any> } | null {
    if (this.isDecisionLocked()) {
      return this.lastAction;
    }

    let bestAction: { type: string; parameters?: Record<string, any> } | null = null;
    let bestScore = -Infinity;

    const allAppraisals = [...this.appraisals, ...dynamicAppraisals];

    for (const appraisal of allAppraisals) {
      const score = this.evaluateAppraisal(appraisal, context);

      if (score > bestScore) {
        bestScore = score;
        bestAction = appraisal.action;
      }
    }

    // TODO: this only locks when an action is chosen twice in a row
    if (bestAction && bestAction === this.lastAction) {
      this.lockDecision(0.3);
      return bestAction;
    }

    if (bestAction) {
      this.lastAction = bestAction;
      return bestAction;
    }

    return null;
  }

  private evaluateAppraisal(
    appraisal: IAppraisal<TContext>,
    context: TContext
  ): number {
    const scores = appraisal.considerations.map(({ consideration, params }) =>
      consideration.evaluate(context, params)
    );

    const scoringFunction = appraisal.scoringFunction ?? this.defaultScoringFunction;
    const weight = appraisal.weight ?? this.defaultWeight;

    const totalScore = scoringFunction(scores);
    return totalScore * weight;
  }
}
