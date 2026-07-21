---
name: use-case-diagram
description: 'Create high-level actor workflows and business-goal breakdowns. Use for use case breakdowns, preconditions, primary goals, and Mermaid flowchart diagrams.'
argument-hint: 'Describe the business workflow or actor journey'
user-invocable: true
disable-model-invocation: false
---

# Use Case Diagram

Use this skill when the user wants a high-level view of how people, roles, or external systems interact with a workflow to reach a business goal.

## Use When
- The request asks about actors, roles, or stakeholders.
- The request asks for business goals, preconditions, or user journeys.
- The request asks for a use case breakdown or a diagram of a process from the actor perspective.

## Procedure
1. Identify the actors involved and the goal each actor is trying to achieve.
2. Capture the minimum preconditions needed for the workflow to start.
3. Summarize the primary goal for each actor in a compact table.
4. Draw the business flow with a Mermaid flowchart using clear, role-based labels.
5. Keep the view high-level and avoid implementation details unless they are needed to understand the goal.

## Output Format
### Use Case Breakdown
| Actor | Pre-conditions | Primary Goal |
| :--- | :--- | :--- |
| ... | ... | ... |

```mermaid
flowchart LR
   ...
```

## Quality Checks
- Actors are named clearly and consistently.
- Preconditions are concise and necessary.
- Goals describe the business outcome, not the technical implementation.
- The flowchart stays readable and does not overload the diagram with detail.
