const db = require('./db/db');
const app = require('./index');
const port = process.env.PORT || 3000;

const init = async () => {
  try {
    await db.sync();
    app.listen(port, function () {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error('There was an error starting the server!', err);
  }
};

init();
