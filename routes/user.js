// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();

// uid2 et crypto-js sont des packages qui vont nous servir à encrypter le mot de passe
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import du model User et Offer
const User = require("../models/User");

// route POST /user/sign_up
router.post("/user/sign_up", async (req, res) => {
  try {
    // Recherche dans la BDD. Est-ce qu'un utilisateur possède cet email ?
    const user = await User.findOne({ email: req.fields.email });

    // Si oui, on renvoie un message et on ne procède pas à l'inscription
    if (user) {
      res.status(409).json({ message: "This email already has an account" });

      // sinon, on passe à la suite...
    } else {
      // l'utilisateur a-t-il bien envoyé les informations requises ?
      if (
        req.fields.email &&
        req.fields.password &&
        req.fields.username &&
        req.fields.description
      ) {
        // Si oui, on peut créer ce nouvel utilisateur

        // Étape 1 : encrypter le mot de passe
        // Générer le token et encrypter le mot de passe
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);

        // Étape 2 : créer le nouvel utilisateur
        const newUser = new User({
          email: req.fields.email,
          token: token,
          hash: hash,
          salt: salt,
          account: {
            username: req.fields.username,
            description: req.fields.description,
          },
        });

        // Étape 3 : sauvegarder ce nouvel utilisateur dans la BDD
        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        // l'utilisateur n'a pas envoyé les informations requises ?
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    //console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

// route POST /user/log_in
router.post("/user/log_in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      if (
        SHA256(req.fields.password + user.salt).toString(encBase64) ===
        user.hash
      ) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
