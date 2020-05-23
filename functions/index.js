const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp()

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getStreams = functions.https.onRequest((request, response) => {
  admin.firestore().collection('streams').get()
    .then(data => {
      let streams = [];
      data.forEach(doc => {
        streams.push(doc.data());
      });
      return response.json(streams);
    })
    .catch(err => console.error(err));
});

exports.createStreams = functions.https.onRequest((request, response) => {
  const newStream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  }

  admin
    .firestore()
    .collection("streams")
    .add(newStream)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created.`})
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong" });
      console.error(err);
    })
});