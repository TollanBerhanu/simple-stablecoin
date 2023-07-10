exports.createOne = model => (req, res) => {

  model.create(req.body)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating!"
      });
    });
};

exports.findAll = model => (req, res) => {
//   const title = req.query.title; // Filter by query parameters
//   var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  model.findAll({ where: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while fetching data."
      });
    });
};

exports.findOne = model => (req, res) => {
  const id = req.params.id;

  model.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving data with id=" + id
      });
    });
};

// Update a model by the id in the request
exports.updateOne = model => (req, res) => {
//   const id = req.params.id;
  const id = 1 // We only need one row

  model.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update data with id=${id}. Maybe data was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating data with id=" + id
      });
    });
};

// Delete a model with the specified id in the request
exports.deleteOne = model => (req, res) => {
    //   const id = req.params.id;
    const id = 1 // We only need one row

    model.destroy({
        where: { id: id }
    })
        .then(num => {
        if (num == 1) {
            res.send({
            message: "Data was deleted successfully!"
            });
        } else {
            res.send({
            message: `Cannot delete data with id=${id}. Maybe data was not found!`
            });
        }
        })
        .catch(err => {
        res.status(500).send({
            message: "Could not delete data with id=" + id
        });
    });
};

// Delete all models from the database.
exports.deleteAll = model => (req, res) => {
  model.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} All data deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all data."
      });
    });
};