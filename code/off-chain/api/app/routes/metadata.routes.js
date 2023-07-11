const db = require("../models");
const model = db.metadata;

module.exports = app => {
    const controller = require("../controllers/crud.controller.js");
  
    var router = require("express").Router();
  
    // Create one
    router.post("/", controller.createOne(model));
  
    // Retrieve all
    router.get("/", controller.findAll(model));
  
    // Retrieve one
    router.get("/:id", controller.findOne(model));
  
    // Update one
    router.put("/:id", controller.updateOne(model));
  
    // Delete one
    router.delete("/:id", controller.deleteOne(model));
  
    // Delete all
    router.delete("/", controller.deleteAll(model));
  
    app.use("/api/metadata", router);
  };
  