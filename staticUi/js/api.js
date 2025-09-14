/* js/api.js
   Centralized API wrapper for profile/project/skills endpoints.
   BASE set to your provided playground URL.
*/
const API = (function(){
  const BASE = "https://me-api-playground-g057.onrender.com";
  const endpoints = {
    // Profile endpoints
    create: BASE + "/api/Profile/Create_profile",                            
    getById: (id) => BASE + "/api/Profile/Get_profile/" + encodeURIComponent(id),   
    update: (id) => BASE + "/api/Profile/Update_profile/" + encodeURIComponent(id), 
    getAll: BASE + "/api/Profile/Get_all_profile",                           

    // Project / Skills endpoints (support query params)
    listProjects: BASE + "/api/Project/List_Project",                        
    listSkills: BASE + "/api/Project/List_Skills",                           
    searchBySkills: BASE + "/api/Project/Search_Profile_By_Skills",          
    addProject: BASE + "/api/Project/Add_Project"                            
  };

  // build querystring helper
  function buildUrl(url, params){
    if(!params) return url;
    const esc = encodeURIComponent;
    const qs = Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map(k => `${esc(k)}=${esc(params[k])}`).join('&');
    return qs ? `${url}?${qs}` : url;
  }

  async function request(url, opts = {}, retry = 1){
    const defaultOpts = { method: 'GET', headers: { 'Accept':'application/json','Content-Type':'application/json' } };
    const final = Object.assign({}, defaultOpts, opts);

    for(let attempt=0; attempt<=retry; attempt++){
      try{
        const res = await fetch(url, final);
        const text = await res.text();
        const contentType = (res.headers.get('Content-Type') || '').toLowerCase();

        let data = null;
        if (contentType.includes('application/json')) {
          try {
            data = text ? JSON.parse(text) : null;
          } catch(parseErr){
            console.warn('JSON parse failed:', parseErr, 'raw:', text);
            data = { __raw: text };
          }
        } else {
          data = { __raw: text };
        }

        if(!res.ok){
          const err = new Error(data?.message || `HTTP ${res.status}`);
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      }catch(err){
        if(attempt < retry){
          await new Promise(r => setTimeout(r, 250 + attempt*200));
          continue;
        }
        console.error('API request error', { url, opts, err });
        throw err;
      }
    }
  }

  return {
    // profiles
    createProfile(payload){ return request(endpoints.create, { method:'POST', body: JSON.stringify(payload) }); },
    getProfileById(id){ return request(endpoints.getById(id), { method:'GET' }); },
    updateProfile(id, payload){ return request(endpoints.update(id), { method:'PUT', body: JSON.stringify(payload) }); },
    getAllProfiles(){ return request(endpoints.getAll, { method:'GET' }); },

    // projects & skills
    getAllProjects(params){ 
      const url = buildUrl(endpoints.listProjects, params);
      return request(url, { method:'GET' });
    },
    getAllSkills(params){ 
      const url = buildUrl(endpoints.listSkills, params);
      return request(url, { method:'GET' });
    },
    searchProfilesBySkills(skillsArr){ 
      return request(endpoints.searchBySkills, { method:'POST', body: JSON.stringify({ skills: skillsArr }) }); 
    },
    addProject(payload){ 
      return request(endpoints.addProject, { method:'POST', body: JSON.stringify(payload) }); 
    }
  };
})();
