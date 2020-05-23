const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get("/streams", (req, res) => {
  admin
    .firestore()
    .collection('streams')
    .get()
    .then((data) => {
      let streams = [];
      data.forEach(doc => {
        streams.push({
          id: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(streams);
    })
    .catch(err => console.error(err));
})

app.post('/stream', (req, res) => {
  const newStream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  }

  admin
    .firestore()
    .collection("streams")
    .add(newStream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created.`})
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    })
})

// exports.api = functions.https.regioni('xxxx').onRequest(app);
exports.api = functions.https.onRequest(app);
