const express = require('express');
const app = express();

app.put('/list', (req, res) => {
  const updatedList = req.body;
  const id = updatedList[0].id;

  // Знайти об'єкт за ID
  const objToUpdate = bd.find(obj => obj.id === id);

  // Оновити властивості
  objToUpdate.text = updatedList[0].text;
  objToUpdate.completed = updatedList[0].completed;

  // Зберегти оновлений bd.json
  fs.writeFile('bd.json', JSON.stringify(bd), err => {
    if (err) {
      res.status(500).send('Error saving to server');
      return;
    }

    res.send('Data saved to server');
  });
});

app.listen(3000);