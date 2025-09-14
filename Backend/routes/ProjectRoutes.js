const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");

// List of Projects 

router.get("/List_Project", ProjectController.ListOfProject);
router.get("/List_Skills", ProjectController.getSkills);
router.post("/Search_Profile_By_Skills", ProjectController.searchProfilesBySkills);
router.post("/Add_Project", ProjectController.addProject);


module.exports = router;
