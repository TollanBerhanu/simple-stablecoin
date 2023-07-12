const db = require("../models");
const serialized_params_model = db.serializedParam;

module.exports = app => {
    const serialized = require("../controllers/crud.controller.js");
  
    var router = require("express").Router();
  
    // Create one
    router.post("/", serialized.createOne(serialized_params_model));
  
    // Retrieve all
    router.get("/", serialized.findAll(serialized_params_model));
  
    // Retrieve one
    router.get("/:id", serialized.findOne(serialized_params_model));
  
    // Update one
    router.put("/:id", serialized.updateOne(serialized_params_model));
  
    // Delete one
    router.delete("/:id", serialized.deleteOne(serialized_params_model));
  
    // Delete all
    router.delete("/", serialized.deleteAll(serialized_params_model));
  
    app.use("/api/serialized-param", router);
  };
  