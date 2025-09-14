const Joi = require("joi");

// Regex for MongoDB ObjectId (24 hex characters)

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const currentYear = new Date().getFullYear();

const profileValidationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "Name must be a text string",
      "string.empty": "Name is required",
      "string.min": "Name must have at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),

  education: Joi.array()
    .items(
      Joi.object({
        institution: Joi.string().min(2).max(150).required().messages({
          "string.empty": "Institution name is required",
          "string.min": "Institution must have at least 2 characters",
          "string.max": "Institution cannot exceed 150 characters",
          "any.required": "Institution name is required",
        }),
        degree: Joi.string().min(2).max(100).required().messages({
          "string.empty": "Degree is required",
          "string.min": "Degree must have at least 2 characters",
          "string.max": "Degree cannot exceed 100 characters",
          "any.required": "Degree is required",
        }),
        fieldOfStudy: Joi.string().max(100).optional().messages({
          "string.max": "Field of study cannot exceed 100 characters",
        }),
        startYear: Joi.number()
          .integer()
          .min(1900)
          .max(currentYear)
          .required()
          .messages({
            "number.base": "Start year must be a valid number",
            "number.min": "Start year cannot be earlier than 1900",
            "number.max": `Start year cannot be later than ${currentYear}`,
            "any.required": "Start year is required",
          }),
        endYear: Joi.number()
          .integer()
          .min(1900)
          .max(currentYear)
          .optional()
          .messages({
            "number.base": "End year must be a valid number",
            "number.min": "End year cannot be earlier than 1900",
            "number.max": `End year cannot be later than ${currentYear}`,
          }),
      })
    )
    .messages({
      "array.base": "Education must be an array of objects",
    }),

  skills: Joi.array()
    .items(Joi.string().min(1).max(50).messages({
      "string.empty": "Skill cannot be empty",
      "string.min": "Skill must have at least 1 character",
      "string.max": "Skill cannot exceed 50 characters",
    }))
    .unique()
    .messages({
      "array.unique": "Duplicate skills are not allowed",
    }),

  projects: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().min(2).max(150).required().messages({
          "string.empty": "Project title is required",
          "string.min": "Project title must have at least 2 characters",
          "string.max": "Project title cannot exceed 150 characters",
        }),
        description: Joi.string().max(500).optional().messages({
          "string.max": "Project description cannot exceed 500 characters",
        }),
        links: Joi.array()
          .items(
            Joi.string()
              .uri({ scheme: ["http", "https"] })
              .messages({
                "string.uri": "Project link must be a valid URL (http/https)",
              })
          )
          .optional(),
      })
    )
    .messages({
      "array.base": "Projects must be an array of objects",
    }),

  work: Joi.array()
    .items(
      Joi.object({
        company: Joi.string().min(2).max(150).required().messages({
          "string.empty": "Company name is required",
          "string.min": "Company name must have at least 2 characters",
          "string.max": "Company name cannot exceed 150 characters",
        }),
        role: Joi.string().min(2).max(100).required().messages({
          "string.empty": "Role is required",
          "string.min": "Role must have at least 2 characters",
          "string.max": "Role cannot exceed 100 characters",
        }),
        startDate: Joi.date().required().messages({
          "date.base": "Start date must be a valid date",
          "any.required": "Start date is required",
        }),
        endDate: Joi.date()
          .greater(Joi.ref("startDate"))
          .optional()
          .messages({
            "date.greater": "End date must be later than start date",
          }),
        description: Joi.string().max(500).optional().messages({
          "string.max": "Work description cannot exceed 500 characters",
        }),
      })
    )
    .messages({
      "array.base": "Work must be an array of objects",
    }),

  links: Joi.object({
    github: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .optional()
      .messages({
        "string.uri": "GitHub link must be a valid URL (http/https)",
      }),
    linkedin: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .optional()
      .messages({
        "string.uri": "LinkedIn link must be a valid URL (http/https)",
      }),
    portfolio: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .optional()
      .messages({
        "string.uri": "Portfolio link must be a valid URL (http/https)",
      }),
  }).optional(),
});


const getProfileValidationSchema = Joi.object({
  id: Joi.string()
    .pattern(objectIdRegex)
    .required()
    .messages({
      "string.base": "Profile ID must be a string",
      "string.empty": "Profile ID is required",
      "string.pattern.base": "Profile ID must be a valid MongoDB ObjectId (24 hex characters)",
      "any.required": "Profile ID is required",
    }),
});

const updateProfileBodySchema = profileValidationSchema.fork(
  Object.keys(profileValidationSchema.describe().keys),
  (field) => field.optional()
).min(1).messages({
  "object.min": "At least one field must be provided for update",
});





module.exports = { profileValidationSchema,getProfileValidationSchema,updateProfileBodySchema };
