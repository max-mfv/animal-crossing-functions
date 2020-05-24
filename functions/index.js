const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./cert/admin.json');

const app = require('express')();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const appConfig = require('./cert/app.json');

const firebase = require('firebase');
firebase.initializeApp(appConfig);

const db = admin.firestore();

app.get("/streams", (req, res) => {
  db
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

  db
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

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }

  db.doc(`/user/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken.' })
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code })
    })
})

// exports.api = functions.https.regioni('xxxx').onRequest(app);
exports.api = functions.https.onRequest(app);
