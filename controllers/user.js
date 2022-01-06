const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptojs = require("crypto-js");
const User = require("../models/user");

//Contrôler pour s'inscrire sur le site avec email et mot de passe(crypté)
exports.signup = (req, res, next) => {
  const emailCrypt = cryptojs.HmacSHA256(req.body.email, process.env.HIDDEN_KEY).toString();
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: emailCrypt,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

//Contrôler pour s'identifier sur le site avec email et mot de passe (ayant été inscit au préalable)
exports.login = (req, res, next) => {
  const emailCrypt = cryptojs.HmacSHA256(req.body.email, process.env.HIDDEN_KEY).toString();
  User.findOne({ email: emailCrypt })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }

          const token = jwt.sign({ userId: user._id }, process.env.HIDDEN_TOKEN, { expiresIn: "24h" });
          console.log("Login réussie !");
          console.log("Création du token = ", token);
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
