## Resources
http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf

## Tips
Inertia:
  * a solution to the "oscillation" problem (AI rapidly switching between actions)
  * Possible solutions:
  * * add weight to any action that is already engaged
  * * cooldowns - apply a strong weight once a decision has been made that can drop off over time
  * * stall the decision making system (time based or until action is completed)

The key to understanding Utility theory is to understand the relationship between the input and the output, and being able to describe that resulting curve. Think of it as a "conversion process"
  * linear
  * quadratic 
  * piecewise linear curves

## Designing Curves
 m = max
 x = value
 w = x / m
 
 Linear: U = x / m
 * consistent relationship between value and utility
 
 Quadratic: U = (x / m) ** k
 * extreme variance at high and low ends of value
 * * large k value has little impact for low x values
 * * conversely, low k value (0 to 1) has greater impact on low x values
 
 Logistic: U = 1 / 1 + e**-x
 * largest rate of change in the center of the input
 
 Piecewise: hand-tune a plot of 2d points
  fully customizable 
  * ex: (hunger, utility) => (0, 1), (15, 1), (25, 0.75), (40, 0.3), (60, 0.05), (80, 0), (100, 0)
  * we can use linear, quadratic, or any type curve within each of the ranges
  * * for 25 to 60 we could use a quadratic and use linear for the others
 
EXAMPLE FUNCTIONS:
`U(w) = 1 - (1 / 1 + (Math.E * 2)**-(w*12)+6)`
 