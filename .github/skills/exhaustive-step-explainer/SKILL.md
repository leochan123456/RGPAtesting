---
name: exhaustive-step-explainer
description: 'Create deep background mechanics and transaction-flow explanations. Use for exhaustive step-by-step breakdowns, internal behavior, transaction processing, and engineering impact analysis.'
argument-hint: 'Describe the internal flow or mechanism to unpack'
user-invocable: true
disable-model-invocation: false
---

# Exhaustive Step Explainer

Use this skill when the user wants a detailed explanation of how a system works internally, especially when the flow has many stages or decision points.

## Use When
- The request asks for deep mechanics, background behavior, or transaction processing.
- The request asks how a system changes state step by step.
- The request asks for an exhaustive explanation with engineering impact.

## Procedure
1. Break the flow into the smallest meaningful components or stages.
2. Describe each step in execution order.
3. For each step, explain what it does and why it matters.
4. Keep the explanation grounded in control flow, state changes, or observable behavior.
5. Avoid skipping over intermediate transitions that are necessary to understand the mechanism.

## Output Format
### Deep Step-by-Step Breakdown
1. **[Component Name]** -> Action details.
   * 💡 *Meaningful Impact:* Engineering reason why this matters.
2. Continue the breakdown in execution order.

## Quality Checks
- The explanation is exhaustive without becoming noisy.
- Each step has a clear purpose and impact.
- The sequence is easy to follow from trigger to outcome.
- Technical depth stays consistent across the breakdown.
