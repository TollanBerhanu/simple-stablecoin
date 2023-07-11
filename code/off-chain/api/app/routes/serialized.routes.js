const db = require("../models");
const serialized_model = db.serialized;

module.exports = app => {
    const serialized = require("../controllers/crud.controller.js");
  
    var router = require("express").Router();
  
    // Create one
    router.post("/", serialized.createOne(serialized_model));
  
    // Retrieve all
    router.get("/", serialized.findAll(serialized_model));
  
    // Retrieve one
    router.get("/:id", serialized.findOne(serialized_model));
  
    // Update one
    router.put("/:id", serialized.updateOne(serialized_model));
  
    // Delete one
    router.delete("/:id", serialized.deleteOne(serialized_model));
  
    // Delete all
    router.delete("/", serialized.deleteAll(serialized_model));
  
    app.use("/api/serialized", router);
  };
  