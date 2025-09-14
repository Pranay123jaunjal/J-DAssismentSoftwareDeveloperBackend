const Profile = require("../models/ProfileModel");
const { profileValidationSchema ,getProfileValidationSchema,updateProfileBodySchema} = require("../ValidationFile/ProfileValidation");


exports.createProfile = async (req, res) => {
  try {
    // 1. Validate request body
    const { error, value } = profileValidationSchema.validate(req.body, {
      abortEarly: false,     
      stripUnknown: true,    
      convert: true,        
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    // 2. Check for duplicate email (unique constraint)
    const existingProfile = await Profile.findOne({ email: value.email });
    if (existingProfile) {
      return res.status(409).json({
        status: "fail",
        message: "A profile with this email already exists",
      });
    }

    // 3. Save profile to DB
    const profile = new Profile(value);
    await profile.save();

    // 4. Return success response
    return res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: profile,
    });

  } catch (err) {
    console.error(" Error creating profile:", err);

    // MongoDB duplicate key error safeguard
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Duplicate field value entered",
        field: Object.keys(err.keyValue),
      });
    }

    // Fallback error
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};
exports. getAllProfiles = async (req, res) => {
  try {
    // Fetch all profiles from the database
    const profiles = await Profile.find();

    // Check if profiles exist
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No profiles found',
      });
    }

    // Send success response with data
    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    // 1. Validate 
    const { error, value } = getProfileValidationSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { id } = value;

    // 2. Fetch profile
 const profile = await Profile.findById(id).select("-createdAt -updatedAt");

    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found",
      });
    }

    // 3. Return success
    return res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    console.error(" Error fetching profile:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // 1. Validate :id param
    const { error: paramError, value: paramValue } =
      getProfileValidationSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (paramError) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: paramError.details.map((err) => err.message),
      });
    }
    const { id } = paramValue;

    // 2. Validate request body
    const { error: bodyError, value: updateData } =
      updateProfileBodySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

    if (bodyError) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: bodyError.details.map((err) => err.message),
      });
    }

    // 3. Handle duplicate email (if updating email)
    if (updateData.email) {
      const existingProfile = await Profile.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingProfile) {
        return res.status(409).json({
          status: "fail",
          message: "Another profile with this email already exists",
        });
      }
    }

    // 4. Perform update
    const updatedProfile = await Profile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
      projection: "-createdAt -updatedAt",
    });

    if (!updatedProfile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found",
      });
    }

    // 5. Track updated fields
    const updatedFields = Object.keys(updateData);

    // Success response
    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      updatedFields, 
      data: updatedProfile,
    });
  } catch (err) {
    console.error("Error updating profile:", err);

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Duplicate field value entered",
        field: Object.keys(err.keyValue),
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};




