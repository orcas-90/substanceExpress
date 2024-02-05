const express = require('express');
const path = require('path');
const fs = require('fs');
const port = 3000;
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { uid } = require('uid');
app.use(bodyParser.json());

app.use(cors());
let state;

app.listen(port, () => {
  console.log(`Приложение запущено и слушает порт ${port}`);
});

app.post('/substance/create', (req, res) => {
  let substance = req.body.substance;
  let boiling = req.body.boiling;
  let freezing = req.body.freezing;
  const database = fs.readFileSync(
    path.join(__dirname, 'database.json'),
    'utf-8'
  );
  const id = uid(6);
  let data = JSON.parse(database);
  data.push({ id, substance, boiling, freezing });
  fs.writeFileSync(
    path.join(__dirname, 'database.json'),
    JSON.stringify(data, null, 4),
    'utf-8'
  );

  res.send(
    JSON.stringify({
      id,
      substance,
      boiling,
      freezing,
    })
  );
  return;
});

app.get('/substance/:id', (req, res) => {
  const id = req.params.id;
  const temp = +req.query.temp;
  const database = fs.readFileSync(
    path.join(__dirname, 'database.json'),
    'utf-8'
  );

  const substances = JSON.parse(database);

  for (const substanceId of substances) {
    if (substanceId.id === id) {
      const boilingTemp = substanceId.boiling;
      const freezingTemp = substanceId.freezing;
      if (temp > boilingTemp) {
        state = 'газообразное';
      }
      if (temp <= freezingTemp) {
        state = 'твердое состояние';
      }
      if (temp > freezingTemp && temp < boilingTemp) {
        state = 'жидкое состояние';
      }

      res.send(JSON.stringify({ substanceId, state }));

      return;
    }
  }

  res.sendStatus(404);
});
