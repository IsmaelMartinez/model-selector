# Deployment Documentation

## Automated Deployment

This project uses GitHub Actions for automated deployment to GitHub Pages.

### Setup Process

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The deployment workflow will run automatically on pushes to `main`

2. **Build Process**:
   - Install dependencies: `npm install`
   - Run tests: `npm test -- --run`
   - Build static site: `npm run build`
   - Deploy to GitHub Pages

### Manual Deployment

If you need to deploy manually:

```bash
# Install dependencies
npm install

# Run tests
npm test -- --run

# Build for production
npm run build

# Preview locally (optional)
npm run preview

# Deploy the contents of `dist/` directory to your hosting provider
```

### Configuration

The application is configured for static site generation:

- **Adapter**: `@sveltejs/adapter-static`
- **Output**: `dist/` directory
- **Prerendering**: Enabled via `+layout.js`

### Environment Requirements

- **Node.js**: 18.x or later
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Bundle Size**: ~40KB gzipped
- **Performance**: <1s load time on fast connections

### Troubleshooting

**Build Issues**:
- Ensure all dependencies are installed: `npm install`
- Check that `static/` directory exists with favicon
- Verify `+layout.js` has `export const prerender = true`

**Runtime Issues**:
- Check browser console for JavaScript errors
- Verify JSON data files are accessible
- Ensure all imports use correct relative paths

### Production Checklist

- [ ] Tests passing: `npm test -- --run`
- [ ] Build successful: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] GitHub Actions workflow configured
- [ ] GitHub Pages enabled in repository settings