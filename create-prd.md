# Create PRD Command

## Instructions for AI

1. **Receive Initial Prompt**: The user provides a brief description or request for a new feature or functionality.

2. **Ask Clarifying Questions**: Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail about:
   - Target users and use cases
   - Success criteria and metrics
   - Technical constraints or requirements
   - Integration points with existing systems
   - Priority and timeline expectations

3. **Generate PRD**: Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.

4. **Save PRD**: Save the generated document as `[n]-prd-[feature-name].md` inside the `/tasks` directory.

## PRD Structure

The PRD should include the following sections:

### 1. Introduction/Overview
Brief description of the feature and its purpose.

### 2. Goals
Clear, measurable objectives this feature aims to achieve.

### 3. User Stories
Detailed user stories following the format: "As a [user type], I want [functionality] so that [benefit]."

### 4. Functional Requirements
Explicit, unambiguous requirements that describe what the feature must do.

### 5. Non-Goals (Out of Scope)
Clear statement of what this feature will NOT include or address.

### 6. Design Considerations (Optional)
UI/UX considerations, accessibility requirements, etc.

### 7. Technical Considerations (Optional)
Architecture, performance, security, and scalability considerations.

### 8. Success Metrics
How will you measure if this feature is successful?

### 9. Open Questions
Any remaining questions or uncertainties that need to be resolved.

## Target Audience
The target audience for the PRD is a junior developer, so the requirements should be explicit, unambiguous, and avoid jargon where possible.