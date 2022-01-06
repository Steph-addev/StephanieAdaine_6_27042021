const Sauce = require("../models/sauce");
const fs = require("fs");

//Controller pour la création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);
  new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  })
    .save()
    .then(() => res.status(201).json({ message: "La sauce a été enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

//Controller pour afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//Controller pour afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//Controller pour modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "La sauce a été modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

//Controller pour supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "La sauce a été supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Controller pour ajouter et enlever des likes
exports.getLikesDislikes = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (like) {
        case 1:
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Ton j'aime a été ajouté !" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        case -1:
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Ton je n'aime pas a été ajouté !" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        case 0:
          if (sauce.usersLiked.find((user_id) => user_id === userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: userId },
              }
            )
              .then(() => res.status(200).json({ message: "Ton j'aime a été supprimé !" }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.find((user_id) => user_id === userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: userId },
              }
            )
              .then(() => res.status(200).json({ message: "Ton je n'aime pas a été supprimé !" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        default:
          console.error("Il y a une erreur dans la requête");
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
