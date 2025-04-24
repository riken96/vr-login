const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post("/createToken", async (req, res) => {
  const idToken = req.body.idToken;
  if (!idToken) return res.status(400).send("Missing idToken");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const customToken = await admin.auth().createCustomToken(uid);

    const tokenPath = path.join(__dirname, "public", "token.json");
    fs.writeFileSync(tokenPath, JSON.stringify({ token: customToken }, null, 2));
    res.send({ token: customToken });
  } catch (err) {
    console.error("Error creating custom token:", err);
    res.status(500).send("Failed to create custom token");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});