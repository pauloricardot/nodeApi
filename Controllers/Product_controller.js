const Item = require("../Models/Item");

module.exports.index = function (req, res, next) {
  try {
    Item.find()
      .lean()
      .sort({ name: 1 })
      .select(" id name image description peso price short_description -_id")
      .exec(function (err, products) {
        //console.log(JSON.stringify(products));
        return res.status(200).send(JSON.stringify(products));
      });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

module.exports.search = function (req, res, next) {
  try {
    //console.log(req.body.name);
    Item.find()
      .or([
        { name: new RegExp(req.body.name, "i") },
        { short_description: new RegExp(req.body.name, "i") },
        { _category: new RegExp(req.body.name, "i") },
      ])
      .lean()
      .sort({ name: 1 })
      .limit(req.body.limit)
      .select(" id name image description peso price short_description -_id")
      .exec(function (err, products) {
        //console.log(JSON.stringify(products));
        return res.status(200).send(JSON.stringify(products));
      });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

module.exports.view = function (req, res, next) {
  try {
    Item.find({ id: req.params.id })
    .populate('variant', 'id name peso')
      .lean()
      .exec(function (err, products) {
        if (!products) {
          return res.status(500).send();
        }
        return res.status(200).send(JSON.stringify(products));
      });
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};
