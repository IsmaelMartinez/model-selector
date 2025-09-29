# Generate Tasks Command

## Instructions for AI

1. **Receive PRD Reference**: The user points the AI to a specific PRD file.

2. **Analyze PRD**: The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.

3. **Assess Current State**: Review the existing codebase to understand existing infrastructure, architectural patterns and conventions.

4. **Phase 1: Generate Parent Tasks**: Based on the PRD analysis and current state assessment, create the file and generate the main, high-level tasks required to implement the feature.

5. **Phase 2: Generate Sub-Tasks**: Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task.

6. **Identify Relevant Files**: Based on the tasks and PRD, identify potential files that will need to be created or modified.

7. **Generate Final Output**: Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.

8. **Save Task List**: Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`.

## Task List Structure

```markdown
# Tasks for [Feature Name]

## Parent Task 1: [High-level task description]
- [ ] 1.1 [Specific sub-task]
- [ ] 1.2 [Specific sub-task]
- [ ] 1.3 [Specific sub-task]

## Parent Task 2: [High-level task description]
- [ ] 2.1 [Specific sub-task]
- [ ] 2.2 [Specific sub-task]

## Relevant Files
- `path/to/file.js` - Brief description of what this file does
- `path/to/another.js` - Brief description of what this file does

## Notes
- Any important considerations or dependencies
- Architecture decisions or patterns to follow
```

## Guidelines

- Tasks should be specific and actionable
- Each sub-task should be completable in a reasonable amount of time
- Include both new file creation and existing file modifications
- Consider testing, documentation, and deployment steps
- Maintain consistency with existing codebase patterns