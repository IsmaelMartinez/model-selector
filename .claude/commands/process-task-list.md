# Process Task List Command

## Instructions for AI

### Task Execution Rules

1. **Do NOT start the next sub-task until you ask the user for permission and they say 'yes' or 'y'.**

2. **When you finish a sub-task**, immediately mark it as completed by changing `[ ]` to `[x]`.

3. **If ALL subtasks underneath a parent task are now `[x]`**, follow this sequence:
   - Run any relevant tests to ensure functionality works
   - Stage changes for commit
   - Clean up any temporary files or debugging code
   - Commit with a descriptive message that explains what was accomplished
   - Ask user for permission to continue to next parent task

4. **Once all the subtasks are marked completed and changes have been committed, mark the parent task as completed.**

5. **Update the task list as you work** - keep the markdown file current with progress.

6. **Maintain the 'Relevant Files' section** - update file descriptions as you work on them.

### Workflow

1. **Start with the first sub-task** (e.g., 1.1)
2. **Complete the sub-task** following existing code patterns and conventions
3. **Mark sub-task as completed** by changing `[ ]` to `[x]`
4. **Ask user for permission** to continue to the next sub-task
5. **Repeat** until all sub-tasks in a parent task are complete
6. **Follow completion sequence** for parent task (test, stage, commit)
7. **Move to next parent task** with user permission

### Communication Guidelines

- Always ask for explicit permission before starting the next task
- Provide brief updates on what was accomplished
- Mention any issues, blockers, or decisions made
- Keep the user informed of overall progress

### Example Workflow

```
✅ Completed sub-task 1.1: Created user authentication component
📝 Updated task list to mark 1.1 as [x]
🔄 Ready to move to sub-task 1.2. May I proceed? (y/n)
```