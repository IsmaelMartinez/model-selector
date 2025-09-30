# ADR-0001: SvelteKit + Vite + Rules-First MVP

## Status
Accepted

## Context
For the initial MVP of the Model Selector, we need to choose a technology stack that enables:
- Fast development and iteration
- Static site generation for PWA deployment
- Offline capability
- Lightweight bundle size
- Future extensibility for local SLM integration

## Decision
We will use SvelteKit with Vite for the MVP, implementing a rules-first approach before adding local SLM parsing.

### Technology Stack:
- **SvelteKit**: For component-based UI with excellent static site generation
- **Vite**: For fast development and optimized builds
- **Rules Engine**: Manual decision graph (YAML/JSON) for initial recommendations
- **PWA**: Service worker for offline functionality

## Consequences

### Positive:
- Rapid MVP development with minimal complexity
- Excellent static site generation and PWA support
- Small bundle size ideal for offline usage
- Clear path to integrate WebGPU/WebAssembly SLM later
- Familiar web technologies for broad contributor accessibility

### Negative:
- Initial version won't have intelligent task parsing (rules-based only)
- Limited to predefined task categories in MVP
- Requires manual curation of decision graph

## Alternatives Considered
**Next.js**: Heavier runtime, less optimal for static/offline use
**Pure HTML/JS**: Too limited for complex decision logic
**Electron**: Unnecessarily heavy for web-first tool