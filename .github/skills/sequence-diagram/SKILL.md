---
name: sequence-diagram
description: 'Create runtime timelines, API call sequences, and messaging cycles. Use for sequence diagrams, request/response order, event flow, and Mermaid sequenceDiagram output.'
argument-hint: 'Describe the runtime flow or message exchange'
user-invocable: true
disable-model-invocation: false
---

# Sequence Diagram

Use this skill when the user wants to see how work unfolds over time across services, components, or messages.

## Use When
- The request asks for runtime order or execution timing.
- The request asks for API call flow, request/response cycles, or event handling.
- The request asks for messaging between components, services, or agents.

## Procedure
1. Identify the initiator, participants, and final outcome.
2. Trace the order of calls, replies, and important state changes.
3. Keep the diagram focused on one runtime path unless the user asks for alternatives.
4. Use a Mermaid sequence diagram with short labels and explicit message directions.
5. Include only the steps needed to understand the live interaction.

## Output Format
### Runtime Sequence
```mermaid
sequenceDiagram
   ...
```

## Quality Checks
- The message order matches the actual runtime flow.
- Participants are minimal but complete.
- Labels are short enough to read without zooming.
- The diagram does not mix in unrelated business context.
