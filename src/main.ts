import './style.css'

/** UTILITY AI */
class UtilityAI<T> {
  #context: T;
  updatePeriod: number;

  #rootReasoner: Reasoner<T>;

  constructor(context: T, reasoner: Reasoner<T>, updatePeriod = 1) {
    this.#context = context;
    this.updatePeriod = updatePeriod;
    this.#rootReasoner = reasoner;
  }
}

/**
 * REASONERS
 * * select CONSIDERATION from a list of CONSIDERATIONS
 * * * first score
 * * * highest score
 */ 
type Reasoner<T> = {
  considerations: Consideration<T>;
  select: (context: T) => Action<T>;
}


/**
 * CONSIDERATIONS
 * * contains a list of APPRAISALS and ACTIONS
 * * calculates the score which represents numerically the utility of its ACTION
 */ 
type Consideration<T> = {
  action: Action<T>;
  score: number;
  appraisals?: Appraisal<T>[];
}

/**
 * APPRAISALS
 */
type Appraisal<T> = {
  getScore: (context: T) => number;
}

/**
 * ACTIONS
 */
type Action<T> = {
  name: string;
  execute: (context: T) => void;
}

/**
 * AGENT
 */
const Agent = {}
