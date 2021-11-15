const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then(() => res.status(200).json({ message: "La sauce a été enregistrée !" }))
    .catch((error) => res.status(400).json({ error: "Il y a eu un problème " + error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? { ...JSON.parse(req.body.sauce), imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "La sauce a été modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

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

exports.getLikesDislikes = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;

  if (like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          likes: +1,
        },
        $push: { usersLiked: userId },
      }
    )
      .then(() => res.status(200).json({ message: "J'aime cette sauce !" }))
      .catch((error) => res.status(400).json({ error }));
  }

  if (like === 0) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          likes: -1,
        },
        $pull: { usersLiked: userId },
      }
    )
      .then(() => res.status(200).json({ message: "J'enlève mon j'aime." }))
      .catch((error) => res.status(400).json({ error }));

    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          dislikes: -1,
        },
        $pull: { usersDiliked: userId },
      }
    )
      .then(() => res.status(200).json())
      .catch((error) => res.status(400).json({ error }));
  }

  if (like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          dislikes: +1,
        },
        $push: { usersDisLiked: userId },
      }
    )
      .then(() => res.status(200).json({ message: "Je n'aime pas cette sauce !" }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
