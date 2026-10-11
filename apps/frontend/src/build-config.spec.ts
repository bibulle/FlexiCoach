import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Production build configuration (apps/frontend/project.json).
 *
 * Critical CSS inlining loads styles.css with media="print" and, since
 * Angular 22, switches it back to "all" with an inline <script>. The
 * production CSP (helmet, apps/backend/src/main.ts) has script-src 'self'
 * and blocks that script: the global styles (.btn, .card, .input…) then
 * never apply. Inlining must stay disabled unless the CSP allows the script.
 */
describe('frontend production build config', () => {
  const project = JSON.parse(
    readFileSync(resolve(__dirname, '../project.json'), 'utf-8'),
  );
  const production = project.targets.build.configurations.production;

  it('does not inline critical CSS (the CSP would block the loader script)', () => {
    expect(production.optimization.styles.inlineCritical).toBe(false);
  });

  it('keeps the other production optimizations enabled', () => {
    expect(production.optimization.scripts).toBe(true);
    expect(production.optimization.styles.minify).toBe(true);
    expect(production.optimization.fonts).toBe(true);
  });
});
