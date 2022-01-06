//Middleware pour contrôler la sécurité du mot de passe

const PasswordValidator = require("password-validator");
const passwordValid = require("password-validator");

const passwordSchema = new PasswordValidator();

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values

module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    return res.status(400).json({ error: "Votre mot de passe n'est pas assez fort, vérifiez que vous avez au moins 8 caractères, 1 majuscule et 2 nombres dans votre mot de passe" });
  }
};
