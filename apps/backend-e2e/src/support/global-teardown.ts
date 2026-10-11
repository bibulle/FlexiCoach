import { killPort } from '@nx/node/utils';
/* eslint-disable */

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.

  // Only stop the backend when this run started it (`e2e` target depends on
  // backend:serve). With `e2e-dev` the developer's own backend keeps running.
  if (process.env.NX_TASK_TARGET_TARGET === 'e2e') {
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await killPort(port);
  }
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
