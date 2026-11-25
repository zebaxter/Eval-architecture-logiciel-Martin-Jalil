const { buildContainer } = require('./main/container');
const { createHttpApp } = require('./interfaces/http/app');

const PORT = process.env.PORT || 3000;

buildContainer().then((useCases) => {
  createHttpApp(useCases).listen(PORT, () => {
    console.log(`Arena Tournament disponible sur http://localhost:${PORT}`);
  });
});
