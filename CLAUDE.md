# Claude Configuration

## Slash Commands

### /create-prd
**Description**: Create a Product Requirements Document for a new feature
**File**: `.claude/commands/create-prd.md`
**Usage**: `/create-prd [brief feature description]`

**Process**:
1. User provides initial feature description
2. AI asks clarifying questions to gather requirements
3. AI generates comprehensive PRD following structured template
4. PRD is saved as `[n]-prd-[feature-name].md` in `/tasks` directory

**Example**: `/create-prd User authentication and login system`

---

### /generate-tasks
**Description**: Generate detailed task list from an existing PRD
**File**: `.claude/commands/generate-tasks.md`
**Usage**: `/generate-tasks [prd-file-path]`

**Process**:
1. AI analyzes the specified PRD file
2. AI assesses current codebase architecture
3. AI generates parent tasks and sub-tasks
4. Task list is saved as `tasks-[prd-file-name].md` in `/tasks` directory

**Example**: `/generate-tasks tasks/1-prd-user-auth.md`

---

### /process-task-list
**Description**: Execute tasks from a generated task list step-by-step
**File**: `.claude/commands/process-task-list.md`
**Usage**: `/process-task-list [task-file-path]`

**Process**:
1. AI loads the specified task list
2. AI executes one sub-task at a time
3. AI asks for permission before each new task
4. AI updates task list with progress markers
5. AI commits changes after completing parent tasks

**Example**: `/process-task-list tasks/tasks-1-prd-user-auth.md`

## Workflow

The typical development workflow using these commands:

1. **Plan**: Use `/create-prd` to define requirements
2. **Break Down**: Use `/generate-tasks` to create implementation plan
3. **Execute**: Use `/process-task-list` to implement step-by-step

## File Structure

- `/tasks/` - Contains all PRDs and task lists
- `.claude/commands/` - Contains Claude command definitions
  - `create-prd.md` - Template and instructions for PRD creation
  - `generate-tasks.md` - Template and instructions for task generation
  - `process-task-list.md` - Instructions for task execution

## Project Information

### Technology Stack
- **Framework**: SvelteKit with Vite
- **Deployment**: Static site generation for PWA
- **Architecture**: Rules-first approach with future SLM integration
- **Testing**: Vitest for unit testing
- **Data**: Static JSON files for model metadata and task taxonomy

### Common Commands
```bash
# Development
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm test           # Run tests

# Git workflow
git status          # Check repository status
git add .          # Stage all changes
git commit -m "msg" # Commit with message
git push           # Push to remote
```

### Code Style
- Follow existing SvelteKit conventions
- Use TypeScript where beneficial
- Maintain component-based architecture
- Keep environmental consciousness in recommendations
- Prioritize offline functionality and PWA capabilities

### Data Management
- **Model Data**: Curated from Hugging Face Hub and Papers with Code
- **Update Process**: Quarterly updates via API queries and manual validation
- **Structure**: 3-tier system (Lightweight/Standard/Advanced) based on model size
- **Documentation**: See `/docs/MODEL_CURATION_PROCESS.md` for detailed process

### Testing Guidelines
- Write tests for logic components
- Test decision graph functionality
- Ensure PWA offline capabilities work
- Test across different browsers for compatibility

## Claude Code Best Practices

Based on [Anthropic's Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices):

### 1. Documentation
- Maintain this `CLAUDE.md` file with project-specific information
- Document common bash commands, core files, and testing instructions
- Keep code style guidelines up to date

### 2. Tool Management
- Use `/permissions` to manage Claude's tool access
- Configure `.claude/settings.json` for project-specific settings
- Leverage MCP servers for extended functionality

### 3. Common Workflows
- **Explore, Plan, Code, Commit**: Understanding → Planning → Implementation → Version Control
- **Write Tests, Commit; Code, Iterate, Commit**: Test-driven development approach
- **Write Code, Screenshot Result, Iterate**: Visual feedback for UI components

### 4. Multi-Claude Workflows
- Separate concerns: one Claude for planning, another for implementation
- Use different Claude instances for frontend vs backend work
- Delegate specialized tasks (testing, documentation) to focused instances

### 5. Automation
- Use headless mode for routine tasks like linting and issue triage
- Automate repetitive development workflows
- Implement CI/CD best practices