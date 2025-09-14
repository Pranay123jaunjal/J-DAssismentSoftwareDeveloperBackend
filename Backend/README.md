# 📘 ME API Playground

A full-stack playground project combining **Express + MongoDB backend** with a **vanilla HTML/CSS/JS frontend**.  
Supports **Profile management, Projects, Skills, and Search**.  

---

## 📐 Architecture

J_DAssismentSoftwareDeveloperBackend/
├── Backend/ # Node.js + Express API
│ ├── server.js # Entry point
│ ├── package.json # Dependencies & scripts
│ ├── config/ # DB connection
│ │ └── db.js
│ ├── controllers/ # Business logic
│ │ ├── ProfileController.js
│ │ └── ProjectController.js
│ ├── models/ # Mongoose schemas
│ │ └── ProfileModel.js
│ ├── routes/ # Express routes
│ │ ├── ProfileRoutes.js
│ │ └── ProjectRoutes.js
│ └── ValidationFile/ # Joi validations
│ ├── ProfileValidation.js
│ └── ProjectValidation.js
│
└── staticUi/ # Frontend (served by backend in prod)
├── index.html # UI
├── css/style.css
└── js/
├── api.js # API wrapper
└── app.js # UI glue code



- **Backend**: REST APIs (Express v5), MongoDB via Mongoose.  
- **Frontend**: Plain HTML/CSS/JS, no frameworks.  
- **Deployment**: Single Render Web Service, backend serves frontend.  

---

## ⚙️ Setup

###  Local Development

1. **Clone repo**:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd task/Backend
2.npm install
3.Create .env in Backend/:
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/me_api_playground
CORS_ORIGINS=http://localhost:5000,http://127.0.0.1:5500


4.npm run dev
  {
  "name": "string",
  "email": "string",
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startYear": "number",
      "endYear": "number"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "links": ["string"]
    }
  ],
  "work": [
    {
      "company": "string",
      "role": "string",
      "startDate": "date",
      "endDate": "date",
      "description": "string"
    }
  ],
  "links": {
    "github": "string",
    "linkedin": "string",
    "portfolio": "string"
  }
}


# api endpoints 

Profile APIs

POST /api/Profile/Create_profile → Create new profile

GET /api/Profile/Get_profile/:id → Get profile by ID

PUT /api/Profile/Update_profile/:id → Update profile

GET /api/Profile/Get_all_profile → List all profiles

Project + Skills APIs

POST /api/Project/Add_Project → Add project to profile

GET /api/Project/List_Project?profileId=...&page=1&limit=10 → List projects by profile

GET /api/Project/List_Skills?profileId=...&page=1&limit=10 → List skills by profile

POST /api/Project/Search_Profile_By_Skills → Search profiles by skills

Sample Requests
Create Profile
curl -X POST http://localhost:5000/api/Profile/Create_profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pranay Jaunjal",
    "email": "pranay123jaunjal@gmail.com",
    "skills": ["Node.js","MongoDB"]
  }'
Get All Profiles
curl http://localhost:5000/api/Profile/Get_all_profile

Get Profile by ID
curl http://localhost:5000/api/Profile/Get_profile/<profileId>

Add Project
curl -X POST http://localhost:5000/api/Project/Add_Project \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "68c44ef9ef9b371ab1344ca5",
    "title": "E-Commerce MERN App",
    "description": "A full-stack e-commerce application",
    "links": ["https://github.com/...","https://app.onrender.com"]
  }'


  List Projects
curl "http://localhost:5000/api/Project/List_Project?profileId=<profileId>&page=1&limit=10"


List Skills
curl "http://localhost:5000/api/Project/List_Skills?profileId=<profileId>&page=1&limit=10"


Search Profiles by Skills
curl -X POST http://localhost:5000/api/Project/Search_Profile_By_Skills \
  -H "Content-Type: application/json" \
  -d '{"skills":["Node.js","MongoDB"]}'

⚠ Known Limitations

1 No authentication/authorization (all APIs are open).

2 Minimal validation (basic Joi, not enforced everywhere).

3 Pagination only implemented for projects/skills, not profiles.

4 Error handling is basic (may leak raw errors).

5 No CI/CD, tests, or monitoring.

6 Project data exists in both Profile.projects and separate Project model → possible duplication.

7 Frontend is vanilla JS (works, but not production-grade UI/UX).

  Future Improvements

JWT authentication & role-based access.

Stronger validation using Joi schemas.

Add pagination & filtering across all APIs.

Improve frontend (React/Vue, better UX).

Automated tests & CI/CD pipelines.

Monitoring/logging (Winston, Sentry, etc.).



