const db = require("../models");
const serialized_model = db.serialized;

module.exports = app => {
    const serialized = require("../controllers/crud.controller.js");
  
    var router = require("express").Router();
  
    // Create one
    router.post("/", serialized.createOne(serialized_model));
  
    // Retrieve all
    router.get("/", serialized_model.findAll);
  
    // Retrieve one
    router.get("/:id", serialized_model.findOne);
  
    // Update one
    router.put("/:id", serialized_model.updateOne);
  
    // Delete one
    router.delete("/:id", serialized_model.deleteOne);
  
    // Delete all
    router.delete("/", serialized_model.deleteAll);
  
    app.use("/api/serialized", router);
  };
  