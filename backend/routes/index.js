const fsPromises = require('node:fs/promises');
const path = require('node:path');

const directory = path.join(__dirname, '.');

const getAllRouteConfigs = async () => {
  const files = await fsPromises.readdir(directory);
  return files
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .map(file => {
      const routeName = file.replace('.js', '');
      return {
        prefix: `/${routeName}`,
        handlerPath: path.join(directory, file),
      };
    })
    .filter(Boolean);
};

const routes = async (fastify, options) => {
  const configs = await getAllRouteConfigs();

  const registrations = configs.map(async ({ prefix, handlerPath }) => {
    const handler = require(handlerPath);
    if (typeof handler !== 'function') {
      console.warn(`[ROUTES] Skipping ${handlerPath} as it does not export a function.`);
      return null;
    }

    await fastify.register(handler, { prefix });
    return prefix;
  });

  const registered = (await Promise.all(registrations)).filter(Boolean);

  if (registered.length) {
    console.log(`[ROUTES] Registered: ${registered.join(', ')}`);
  }
};

module.exports = routes;
