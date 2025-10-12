# Claude Configuration

## Commands

| Command | Usage | Purpose |
|---------|-------|---------|
| `/create-prd [feature]` | Creates PRD in `/tasks` | Define requirements |
| `/generate-tasks [prd-file]` | Creates task list from PRD | Break down implementation |
| `/process-task-list [task-file]` | Execute tasks step-by-step | Implement features |

## Workflow
1. **Plan**: `/create-prd` → 2. **Break Down**: `/generate-tasks` → 3. **Execute**: `/process-task-list`

## Project Information

### Technology Stack
- **Framework**: SvelteKit with Vite
- **Deployment**: Static site generation for PWA
- **Testing**: Vitest
- **Data**: Static JSON files for model metadata

### Common Commands
```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm run build   # Build for production
npm test        # Run tests
```

### Code Style
- Follow SvelteKit conventions
- Use TypeScript where beneficial
- Component-based architecture
- Environmental consciousness in recommendations
- Prioritize PWA capabilities
- This project uses vite as a framework.