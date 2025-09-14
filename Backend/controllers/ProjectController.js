const Profile = require("../models/ProfileModel");
const { listProjectsSchema,addProjectSchema,getSkillsSchema,searchProfilesBySkillsSchema } = require("../ValidationFile/ProjectValidation");




exports.addProject = async (req, res) => {
  try {
    //  Validate request body
    const { error, value } = addProjectSchema.validate(req.body, {
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

    const { profileId, title, description, links } = value;

    //  Find the profile
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found. Cannot add project.",
      });
    }
    const newProject = { title, description, links };

    //  Push project into profile.projects
    profile.projects.push(newProject);
    await profile.save();

    // . Success response
    return res.status(201).json({
      status: "success",
      message: "Project added successfully.",
      data: profile.projects[profile.projects.length - 1],
    });
  } catch (err) {
    console.error("Error adding project:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};

exports.ListOfProject = async (req, res) => {
  try {
    const { error, value } = listProjectsSchema.validate(req.query, {
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

    const { profileId, page, limit } = value;

    const profile = await Profile.findById(profileId).select("projects");
    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found.",
      });
    }

    const totalProjects = profile.projects.length;
    const totalPages = Math.ceil(totalProjects / limit);

    // If page exceeds totalPages, return empty data
    if (page > totalPages && totalProjects > 0) {
      return res.status(200).json({
        status: "success",
        message: "No projects found for this page.",
        data: [],
        pagination: {
          totalProjects,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }

    const startIndex = (page - 1) * limit;
    const paginatedProjects = profile.projects.slice(
      startIndex,
      startIndex + limit
    );
    return res.status(200).json({
      status: "success",
      message: "Projects fetched successfully.",
      data: paginatedProjects,
      pagination: {
        totalProjects,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("Error fetching projects:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};

exports.getSkills = async (req, res) => {
  try {
    // 1. Validate query params
    const { error, value } = getSkillsSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed.",
        errors: error.details.map((err) => err.message),
      });
    }

    const { profileId, page, limit } = value;

    const profile = await Profile.findById(profileId).select("skills");
    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found. Cannot fetch skills.",
      });
    }

    const totalSkills = profile.skills.length;
    const totalPages = Math.ceil(totalSkills / limit) || 1;

    // If page > totalPages → return empty but valid response
    const currentPage = page > totalPages ? totalPages : page;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedSkills = profile.skills.slice(startIndex, endIndex);

    return res.status(200).json({
      status: "success",
      message: "Skills fetched successfully.",
      data: paginatedSkills,
      pagination: {
        totalSkills,
        totalPages,
        currentPage,
        limit,
      },
    });
  } catch (err) {
    console.error(" Error fetching skills:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};



exports.searchProfilesBySkills = async (req, res) => {
  try {
    //  Validate request query
    const { error, value } = searchProfilesBySkillsSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed.",
        errors: error.details.map((err) => err.message),
      });
    }

    const { skills, page, limit } = value;

    //  Pagination setup
    const skip = (page - 1) * limit;

    // Query database
    const profiles = await Profile.find(
      { skills: { $in: skills } },
      "-createdAt -updatedAt"     
    )
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProfiles = await Profile.countDocuments({ skills: { $in: skills } });

    if (!profiles.length) {
      return res.status(404).json({
        status: "fail",
        message: "No profiles found matching the given skills.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profiles fetched successfully.",
      data: profiles,
      pagination: {
        totalProfiles,
        totalPages: Math.ceil(totalProfiles / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error(" Error searching profiles by skills:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error. Please try again later.",
    });
  }
};