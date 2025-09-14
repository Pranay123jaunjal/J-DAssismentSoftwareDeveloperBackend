const Joi = require("joi");


// Add Project Validation - All fields optional
const addProjectSchema = Joi.object({
   profileId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Profile ID is required.",
      "string.empty": "Profile ID cannot be empty.",
      "string.pattern.base": "Profile ID must be a valid MongoDB ObjectId.",
    }),
  title: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .optional()
    .messages({
      "string.min": "Project title must be at least 2 characters",
      "string.max": "Project title cannot exceed 150 characters",
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow("")
    .messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),

  links: Joi.array()
    .items(
      Joi.string()
        .uri()
        .trim()
        .messages({
          "string.uri": "Each link must be a valid URL",
        })
    )
    .optional()
    .messages({
      "array.base": "Links must be an array of URLs",
    }),
})
  .min(1) // at least one field must be present
  .messages({
    "object.min": "At least one field is required to add/update project",
    "object.base": "Project data must be an object",
  });



const basePaginationSchema = {
  profileId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Profile ID is required.",
      "string.empty": "Profile ID cannot be empty.",
      "string.pattern.base": "Profile ID must be a valid MongoDB ObjectId.",
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Page number must be a number.",
      "number.integer": "Page number must be an integer.",
      "number.min": "Page number must be at least 1.",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      "number.base": "Limit must be a number.",
      "number.integer": "Limit must be an integer.",
      "number.min": "Limit must be at least 1.",
      "number.max": "Limit cannot exceed 50 records per page.",
    }),
};
const listProjectsSchema = Joi.object({
  ...basePaginationSchema, 
});

const getSkillsSchema = Joi.object({
  ...basePaginationSchema, 
});

const searchProfilesBySkillsSchema = Joi.object({
  skills: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .messages({
          "string.base": "Each skill must be a text string.",
          "string.empty": "Skill cannot be empty.",
          "string.min": "Skill must have at least 1 character.",
          "string.max": "Skill cannot exceed 50 characters.",
        })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Skills must be provided as an array of strings.",
      "array.min": "At least one skill is required to search profiles.",
      "any.required": "Skills are required.",
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Page must be a number.",
      "number.integer": "Page must be an integer.",
      "number.min": "Page must be at least 1.",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      "number.base": "Limit must be a number.",
      "number.integer": "Limit must be an integer.",
      "number.min": "Limit must be at least 1.",
      "number.max": "Limit cannot exceed 50 records per page.",
    }),
});


module.exports = { basePaginationSchema ,getSkillsSchema,listProjectsSchema,searchProfilesBySkillsSchema,addProjectSchema};
