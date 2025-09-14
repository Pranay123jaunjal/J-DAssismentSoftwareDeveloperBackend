const express = require("express");
const router = express.Router();
const profileController = require("../controllers/ProfileController");

// Create Profile
router.post("/Create_profile", profileController.createProfile);

// Get Profile by ID
router.get("/Get_profile/:id", profileController.getProfileById);

// Get All Profile
router.get("/Get_all_profile", profileController.getAllProfiles);

// Update Profile
router.put("/Update_profile/:id", profileController.updateProfile);

module.exports = router;
