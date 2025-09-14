// app.js - UI glue w/ projects + skills + search + profile-scoped project & skill loading
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const toast = $('#toast');
function showToast(msg, t=2200){ toast.textContent = msg; toast.classList.add('show'); setTimeout(()=> toast.classList.remove('show'), t); }
function escapeHtml(str=''){ return String(str||'').replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

// Elements
const idInput = $('#idInput'), getBtn = $('#getBtn'), clearBtn = $('#clearBtn');
const createForm = $('#createForm'), createStatus = $('#createStatus');
const detailEl = $('#detail');
const updateForm = $('#updateForm'), updateStatus = $('#updateStatus');

// all lists
const allStatus = $('#allStatus'), allProfilesEl = $('#allProfiles');
const projStatus = $('#projStatus'), allProjectsEl = $('#allProjects');
const skillsStatus = $('#skillsStatus'), allSkillsWrap = $('#allSkills');
const skillSelect = $('#skillSelect'), searchBySkillsBtn = $('#searchBySkillsBtn'), clearSearchBtn = $('#clearSearchBtn');
const searchResult = $('#searchResult');

// Add Project form
const addProjectForm = $('#addProjectForm'), addProjectStatus = $('#addProjectStatus');

// dynamic containers (create)
const eduContainer = $('#eduContainer'), addEduBtn = $('#addEduBtn');
const projContainer = $('#projContainer'), addProjBtn = $('#addProjBtn');
const workContainer = $('#workContainer'), addWorkBtn = $('#addWorkBtn');
const skillInput = $('#skillInput'), skillsList = $('#skillsList');
let skills = [];

// dynamic containers (update)
const updEduContainer = $('#updEduContainer'), updAddEduBtn = $('#updAddEduBtn');
const updProjContainer = $('#updProjContainer'), updAddProjBtn = $('#updAddProjBtn');
const updWorkContainer = $('#updWorkContainer'), updAddWorkBtn = $('#updAddWorkBtn');
const updSkillInput = $('#updSkillInput'), updSkillsList = $('#updSkillsList');
let updSkills = [];

/* ---------- helpers ---------- */
function extractProfile(raw){
  if(!raw) return null;
  if(typeof raw === 'object' && (raw.name || raw.email || raw.education || raw.skills || raw.projects || raw.work)) return raw;
  const wrapperKeys = ['profile','data','result','payload','doc','user','item','body'];
  for(const k of wrapperKeys){
    if(raw[k] && typeof raw[k] === 'object' && (raw[k].name || raw[k].email || raw[k].education || raw[k].skills)) return raw[k];
    if(Array.isArray(raw[k]) && raw[k].length && (raw[k][0].name || raw[k][0].email)) return raw[k][0];
  }
  if(raw.data && typeof raw.data === 'object'){ const nested = extractProfile(raw.data); if(nested) return nested; }
  if(Array.isArray(raw) && raw.length && (raw[0].name || raw[0].email)) return raw[0];
  return null;
}

function makeEduEntry({institution='', degree='', fieldOfStudy='', startYear='', endYear=''} = {}){
  const div = document.createElement('div'); div.className='entry edu-entry';
  div.innerHTML = `
    <div class="row">
      <label>Institution<input class="institution" value="${escapeHtml(institution)}" /></label>
      <label>Degree<input class="degree" value="${escapeHtml(degree)}" /></label>
      <label>Field<input class="fieldOfStudy" value="${escapeHtml(fieldOfStudy)}" /></label>
    </div>
    <div class="row">
      <label>Start Year<input type="number" class="startYear" value="${escapeHtml(startYear)}" /></label>
      <label>End Year<input type="number" class="endYear" value="${escapeHtml(endYear)}" /></label>
      <button type="button" class="remove entry-remove">Remove</button>
    </div>
  `;
  div.querySelector('.entry-remove').addEventListener('click', ()=> div.remove());
  return div;
}
function makeProjectEntry({title='', description='', links=[]} = {}){
  const div = document.createElement('div'); div.className='entry proj-entry';
  div.innerHTML = `
    <label>Title<input class="p-title" value="${escapeHtml(title)}" /></label>
    <label>Description<textarea class="p-desc">${escapeHtml(description)}</textarea></label>
    <label>Links (comma separated)<input class="p-links" value="${escapeHtml((links||[]).join(','))}" /></label>
    <div style="margin-top:.4rem"><button type="button" class="remove entry-remove">Remove</button></div>
  `;
  div.querySelector('.entry-remove').addEventListener('click', ()=> div.remove());
  return div;
}
function makeWorkEntry({company='', role='', startDate='', endDate='', description=''} = {}){
  const div = document.createElement('div'); div.className='entry work-entry';
  div.innerHTML = `
    <label>Company<input class="w-company" value="${escapeHtml(company)}" /></label>
    <label>Role<input class="w-role" value="${escapeHtml(role)}" /></label>
    <div class="row">
      <label>Start Date<input type="date" class="w-start" value="${escapeHtml(startDate)}" /></label>
      <label>End Date<input type="date" class="w-end" value="${escapeHtml(endDate)}" /></label>
    </div>
    <label>Description<textarea class="w-desc">${escapeHtml(description)}</textarea></label>
    <div style="margin-top:.4rem"><button type="button" class="remove entry-remove">Remove</button></div>
  `;
  div.querySelector('.entry-remove').addEventListener('click', ()=> div.remove());
  return div;
}
function renderSkillsChips(list, container){
  container.innerHTML = '';
  list.forEach((s, idx)=>{
    const span = document.createElement('span'); span.className='chip';
    span.innerHTML = `${escapeHtml(s)} <span class="x" data-i="${idx}">✕</span>`;
    container.appendChild(span);
    span.querySelector('.x').addEventListener('click', (e)=>{
      list.splice(Number(e.target.dataset.i),1);
      renderSkillsChips(list, container);
    });
  });
}
function addSkillFromInput(inputEl, list, container){
  const raw = inputEl.value.trim();
  if(!raw) return;
  const parts = raw.split(',').map(p=>p.trim()).filter(Boolean);
  parts.forEach(p=>{ if(!list.includes(p)) list.push(p); });
  inputEl.value = '';
  renderSkillsChips(list, container);
}

// attach add buttons & skill inputs
addEduBtn.addEventListener('click', ()=> eduContainer.appendChild(makeEduEntry()));
addProjBtn.addEventListener('click', ()=> projContainer.appendChild(makeProjectEntry()));
addWorkBtn.addEventListener('click', ()=> workContainer.appendChild(makeWorkEntry()));
updAddEduBtn.addEventListener('click', ()=> updEduContainer.appendChild(makeEduEntry()));
updAddProjBtn.addEventListener('click', ()=> updProjContainer.appendChild(makeProjectEntry()));
updAddWorkBtn.addEventListener('click', ()=> updWorkContainer.appendChild(makeWorkEntry()));

skillInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===','){ e.preventDefault(); addSkillFromInput(skillInput, skills, skillsList); }});
updSkillInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===','){ e.preventDefault(); addSkillFromInput(updSkillInput, updSkills, updSkillsList); }});

function collectEducation(container){
  return Array.from(container.querySelectorAll('.edu-entry')).map(div=>({
    institution: div.querySelector('.institution').value.trim(),
    degree: div.querySelector('.degree').value.trim(),
    fieldOfStudy: div.querySelector('.fieldOfStudy').value.trim(),
    startYear: Number(div.querySelector('.startYear').value) || undefined,
    endYear: Number(div.querySelector('.endYear').value) || undefined
  })).filter(e=>e.institution || e.degree || e.fieldOfStudy);
}
function collectProjects(container){
  return Array.from(container.querySelectorAll('.proj-entry')).map(div=>({
    title: div.querySelector('.p-title').value.trim(),
    description: div.querySelector('.p-desc').value.trim(),
    links: (div.querySelector('.p-links').value || '').split(',').map(s=>s.trim()).filter(Boolean)
  })).filter(p=>p.title || p.description);
}
function collectWork(container){
  return Array.from(container.querySelectorAll('.work-entry')).map(div=>({
    company: div.querySelector('.w-company').value.trim(),
    role: div.querySelector('.w-role').value.trim(),
    startDate: div.querySelector('.w-start').value || undefined,
    endDate: div.querySelector('.w-end').value || undefined,
    description: div.querySelector('.w-desc').value.trim()
  })).filter(w=>w.company || w.role);
}

/* ---------- CREATE profile ---------- */
createForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(createForm);
  const payload = {
    name: fd.get('name'),
    email: fd.get('email'),
    education: collectEducation(eduContainer),
    skills: skills.slice(),
    projects: collectProjects(projContainer),
    work: collectWork(workContainer),
    links: {
      github: fd.get('links.github') || '',
      linkedin: fd.get('links.linkedin') || '',
      portfolio: fd.get('links.portfolio') || ''
    }
  };
  createStatus.textContent = 'Creating...';
  try{
    const res = await API.createProfile(payload);
    createStatus.textContent = 'Created ✅';
    showToast('Profile created');
    if(res && (res.id || res._id)){ idInput.value = res.id || res._id; }
    const profile = extractProfile(res) || res;
    renderProfile(profile);
    createForm.reset(); skills=[]; renderSkillsChips(skills, skillsList);
    eduContainer.innerHTML=''; projContainer.innerHTML=''; workContainer.innerHTML='';
    await Promise.all([ loadAll(), loadProjects(), loadSkills() ]);
  }catch(err){
    console.error(err);
    createStatus.textContent = 'Create failed';
    showToast('Create failed — check console');
  }finally{ setTimeout(()=> createStatus.textContent = '', 1800); }
});

/* ---------- GET by ID ---------- */
getBtn.addEventListener('click', async ()=>{
  const id = idInput.value.trim();
  if(!id){ showToast('Enter profile ID'); return; }
  detailEl.textContent = 'Loading...';
  try{
    const raw = await API.getProfileById(id);
    console.debug('GET /Get_profile raw response:', raw);
    const profile = extractProfile(raw);
    if(!profile){
      console.warn('Could not find profile object in response', raw);
      detailEl.textContent = 'Profile not found in response (check console)';
      updateForm.style.display = 'none';
      return;
    }
    renderProfile(profile);
    populateUpdateForm(profile);

    // when viewing a profile, auto-load projects & skills for this profile (page 1, limit 10)
    const pid = profile.id || profile._id || profile._id?.toString?.();
    if(pid){
      await Promise.all([
        loadProjects({ profileId: pid, page: 1, limit: 10 }),
        loadSkills({ profileId: pid, page: 1, limit: 10 })
      ]);
      // auto-fill Add Project form profileId for convenience
      const profileIdInput = addProjectForm.querySelector('[name="profileId"]');
      if(profileIdInput) profileIdInput.value = pid;
    }
    showToast('Loaded profile');
  }catch(err){
    console.error(err);
    detailEl.textContent = 'Error loading profile';
    updateForm.style.display = 'none';
    showToast('Load failed');
  }
});

/* ---------- CLEAR ---------- */
clearBtn.addEventListener('click', ()=>{ idInput.value=''; detailEl.innerHTML='Use the ID field + Get to load a profile.'; updateForm.style.display='none'; showToast('Cleared'); });

/* ---------- renderProfile ---------- */
function renderProfile(p){
  if(!p){ detailEl.innerHTML='No profile'; return; }
  const id = p.id || p._id || '';
  detailEl.innerHTML = `
    <h3>${escapeHtml(p.name || '')}</h3>
    <p><strong>Email:</strong> ${escapeHtml(p.email||'')}</p>
    <p><strong>Skills:</strong> ${(p.skills||[]).map(s=>escapeHtml(s)).join(', ')}</p>
    <div style="margin-top:.6rem">
      <strong>Education:</strong>
      <div>${(p.education||[]).map(e=>`<div class="muted">${escapeHtml(e.degree||'')} — ${escapeHtml(e.institution||'')} (${escapeHtml(e.startYear||'')}-${escapeHtml(e.endYear||'')})</div>`).join('')}</div>
    </div>
    <div style="margin-top:.6rem"><strong>Projects:</strong>
      <div>${(p.projects||[]).map(pr=>`<div class="muted"><strong>${escapeHtml(pr.title||'')}</strong><div>${escapeHtml(pr.description||'')}</div><div>${(pr.links||[]).map(l=>`<a href="${escapeHtml(l)}" target="_blank">${escapeHtml(l)}</a>`).join(' | ')}</div></div>`).join('')}</div>
    </div>
    <div style="margin-top:.6rem"><strong>Work:</strong>
      <div>${(p.work||[]).map(w=>`<div class="muted">${escapeHtml(w.role||'')} @ ${escapeHtml(w.company||'')} (${escapeHtml(w.startDate||'')}-${escapeHtml(w.endDate||'')})</div>`).join('')}</div>
    </div>
    <div style="margin-top:.6rem" class="muted">ID: ${escapeHtml(id)}</div>
  `;
}

/* ---------- populateUpdateForm ---------- */
function populateUpdateForm(p){
  if(!p){ updateForm.style.display='none'; return; }
  updateForm.style.display='block';
  const idField = updateForm.querySelector('[name="id"]'); if(idField) idField.value = p.id || p._id || '';
  const nameField = updateForm.querySelector('[name="name"]'); const emailField = updateForm.querySelector('[name="email"]');
  if(nameField) nameField.value = p.name || ''; if(emailField) emailField.value = p.email || '';
  const githubField = updateForm.querySelector('[name="links.github"]'); const linkedinField = updateForm.querySelector('[name="links.linkedin"]'); const portfolioField = updateForm.querySelector('[name="links.portfolio"]');
  if(githubField) githubField.value = (p.links && p.links.github) || ''; if(linkedinField) linkedinField.value = (p.links && p.links.linkedin) || ''; if(portfolioField) portfolioField.value = (p.links && p.links.portfolio) || '';
  updEduContainer.innerHTML = ''; (p.education||[]).forEach(e=> updEduContainer.appendChild(makeEduEntry(e)));
  updProjContainer.innerHTML = ''; (p.projects||[]).forEach(pr=> updProjContainer.appendChild(makeProjectEntry(pr)));
  updWorkContainer.innerHTML = ''; (p.work||[]).forEach(w=> updWorkContainer.appendChild(makeWorkEntry(w)));
  updSkills = Array.isArray(p.skills) ? p.skills.slice() : []; renderSkillsChips(updSkills, updSkillsList);
}

/* ---------- UPDATE profile ---------- */
updateForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(updateForm);
  const id = fd.get('id');
  if(!id){ showToast('Missing id'); return; }
  const payload = {
    name: fd.get('name'),
    email: fd.get('email'),
    education: collectEducation(updEduContainer),
    skills: updSkills.slice(),
    projects: collectProjects(updProjContainer),
    work: collectWork(updWorkContainer),
    links: {
      github: fd.get('links.github'),
      linkedin: fd.get('links.linkedin'),
      portfolio: fd.get('links.portfolio')
    }
  };
  updateStatus.textContent = 'Updating...';
  try{
    const res = await API.updateProfile(id, payload);
    updateStatus.textContent = 'Updated ✅';
    showToast('Profile updated');
    const profile = extractProfile(res) || res;
    renderProfile(profile); populateUpdateForm(profile);
    await Promise.all([ loadAll(), loadProjects(), loadSkills() ]);
  }catch(err){
    console.error(err); updateStatus.textContent = 'Update failed'; showToast('Update failed — check console');
  }finally{ setTimeout(()=> updateStatus.textContent = '', 1800); }
});

/* ---------- ADD PROJECT (new) ---------- */
addProjectForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(addProjectForm);
  const payload = {
    profileId: fd.get('profileId'),
    title: fd.get('title'),
    description: fd.get('description'),
    links: (fd.get('links') || '').split(',').map(s=>s.trim()).filter(Boolean)
  };
  if(!payload.profileId || !payload.title){ showToast('profileId & title required'); return; }
  addProjectStatus.textContent = 'Adding...';
  try{
    const res = await API.addProject(payload);
    addProjectStatus.textContent = 'Added ✅';
    showToast('Project added');
    addProjectForm.reset();
    // reload projects & skills appropriately
    const currentPid = idInput.value.trim();
    if(currentPid === payload.profileId){
      await Promise.all([ loadProjects({ profileId: payload.profileId, page:1, limit:10 }), loadSkills({ profileId: payload.profileId, page:1, limit:10 }) ]);
    } else {
      await Promise.all([ loadProjects(), loadSkills() ]);
    }
    await loadAll(); // refresh profiles list if needed
  }catch(err){
    console.error(err); addProjectStatus.textContent = 'Add failed'; showToast('Add failed — check console');
  }finally{ setTimeout(()=> addProjectStatus.textContent = '', 1800); }
});

/* ---------- LOAD ALL PROFILES ---------- */
async function loadAll(){
  allStatus.textContent = 'Loading...'; allProfilesEl.innerHTML = '';
  try{
    const data = await API.getAllProfiles();
    console.debug('GET /Get_all_profile raw response:', data);
    let profiles = [];
    if(Array.isArray(data)) profiles = data;
    else if(data && Array.isArray(data.profiles)) profiles = data.profiles;
    else if(data && Array.isArray(data.data)) profiles = data.data;
    else if(data && Array.isArray(data.result)) profiles = data.result;
    else if(data && data.__raw){ allStatus.textContent = 'Server returned non-JSON response (check console)'; console.warn('Get all raw:', data.__raw); return; }
    else { const extracted = extractProfile(data); if(extracted) profiles = [extracted]; }

    if(!profiles.length){ allStatus.textContent = 'No profiles found.'; return; }
    allStatus.textContent = `Found ${profiles.length} profiles:`;
    profiles.forEach(p=>{
      const li = document.createElement('li');
      li.textContent = `${p.name || 'Unnamed'} — ${p.email || ''}`;
      li.addEventListener('click', async ()=>{
        if(p.id || p._id){
          idInput.value = p.id || p._id;
          getBtn.click();
          // Also load projects & skills for this profile
          const pid = p.id || p._id;
          await Promise.all([ loadProjects({ profileId: pid, page:1, limit:10 }), loadSkills({ profileId: pid, page:1, limit:10 }) ]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      allProfilesEl.appendChild(li);
    });
  }catch(err){
    console.error(err); allStatus.textContent = 'Error loading profiles'; showToast('Failed to load all profiles');
  }
}

/* ---------- LOAD PROJECTS (updated to accept params) ----------
   params: { profileId, page, limit }
   If profileId provided, requests: /List_Project?profileId=...&page=1&limit=10
   If no params, calls /List_Project with no querystring (server may return global list)
*/
async function loadProjects(params = { page:1, limit:10 }){
  projStatus.textContent = 'Loading...'; allProjectsEl.innerHTML = '';
  try{
    const apiParams = Object.assign({}, params);
    if(!apiParams.page) apiParams.page = 1;
    if(!apiParams.limit) apiParams.limit = 10;

    const data = await API.getAllProjects(apiParams);
    console.debug('GET /List_Project raw response:', data, 'params:', apiParams);

    let projects = [];
    if(Array.isArray(data)) projects = data;
    else if(data && Array.isArray(data.projects)) projects = data.projects;
    else if(data && Array.isArray(data.data)) projects = data.data;
    else if(data && Array.isArray(data.result)) projects = data.result;
    else if(data && data.__raw){ projStatus.textContent = 'Server returned non-JSON response (check console)'; console.warn('Projects raw:', data.__raw); return; }
    else if(data && typeof data === 'object' && (data.title || data.description)) projects = [data];

    if(!projects.length){ projStatus.textContent = 'No projects found.'; return; }
    projStatus.textContent = `Found ${projects.length} projects:`;
    projects.forEach(pr=>{
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(pr.title || '')}</strong><div class="muted">${escapeHtml(pr.description || '')}</div>`;
      allProjectsEl.appendChild(li);
    });
  }catch(err){
    console.error(err); projStatus.textContent = 'Error loading projects'; showToast('Failed to load projects');
  }
}

/* ---------- LOAD SKILLS (updated to accept params) ----------
   params: { profileId, page, limit }
   calls: /List_Skills?profileId=...&page=1&limit=10
   if no params -> global skill list
*/
async function loadSkills(params = undefined){
  skillsStatus.textContent = 'Loading...'; allSkillsWrap.innerHTML = ''; skillSelect.innerHTML = '';
  try{
    const apiParams = Object.assign({}, params || {});
    if(apiParams && !apiParams.page) apiParams.page = 1;
    if(apiParams && !apiParams.limit) apiParams.limit = 10;

    const data = await API.getAllSkills(apiParams);
    console.debug('GET /List_Skills raw response:', data, 'params:', apiParams);

    let skillsArr = [];
    if(Array.isArray(data)) skillsArr = data;
    else if(data && Array.isArray(data.skills)) skillsArr = data.skills;
    else if(data && Array.isArray(data.data)) skillsArr = data.data;
    else if(data && Array.isArray(data.result)) skillsArr = data.result;
    else if(data && data.__raw){ skillsStatus.textContent = 'Server returned non-JSON response'; console.warn('Skills raw:', data.__raw); return; }
    else if(typeof data === 'string') skillsArr = data.split(',').map(s=>s.trim()).filter(Boolean);
    else if(typeof data === 'object' && Object.values(data).every(v => typeof v === 'string')) {
      // fallback: object of skill keys
      skillsArr = Object.values(data).map(String);
    }

    if(!skillsArr.length){ skillsStatus.textContent = 'No skills found.'; return; }
    skillsStatus.textContent = `Found ${skillsArr.length} skills:`;
    skillsArr.forEach(s=>{
      const span = document.createElement('span'); span.className = 'chip'; span.textContent = s;
      allSkillsWrap.appendChild(span);
      const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
      skillSelect.appendChild(opt);
    });
  }catch(err){
    console.error(err); skillsStatus.textContent = 'Error loading skills'; showToast('Failed to load skills');
  }
}

/* ---------- SEARCH BY SKILLS ---------- */
searchBySkillsBtn.addEventListener('click', async ()=>{
  const selected = Array.from(skillSelect.selectedOptions).map(o=>o.value);
  if(!selected.length){ showToast('Select at least one skill'); return; }
  searchResult.textContent = 'Searching...';
  try{
    const res = await API.searchProfilesBySkills(selected);
    console.debug('POST /Search_Profile_By_Skills raw response:', res);
    let profiles = [];
    if(Array.isArray(res)) profiles = res;
    else if(res && Array.isArray(res.profiles)) profiles = res.profiles;
    else if(res && Array.isArray(res.data)) profiles = res.data;
    else if(res && res.__raw){ searchResult.textContent = 'Server returned non-JSON response (check console)'; console.warn('Search raw:', res.__raw); return; }
    else { const extracted = extractProfile(res); if(extracted) profiles = [extracted]; }

    if(!profiles.length){ searchResult.textContent = 'No profiles matched.'; return; }
    searchResult.innerHTML = `<div class="muted">Found ${profiles.length} results:</div><ul class="list"></ul>`;
    const ul = searchResult.querySelector('ul');
    profiles.forEach(p=>{
      const li = document.createElement('li');
      li.textContent = `${p.name || 'Unnamed'} — ${p.email || ''}`;
      li.addEventListener('click', async ()=>{ 
        if(p.id || p._id){
          idInput.value = p.id || p._id; 
          getBtn.click(); 
          await Promise.all([ loadProjects({ profileId: p.id || p._id, page:1, limit:10 }), loadSkills({ profileId: p.id || p._id, page:1, limit:10 }) ]);
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        } 
      });
      ul.appendChild(li);
    });
  }catch(err){
    console.error(err); searchResult.textContent = 'Search failed'; showToast('Search failed — check console');
  }
});
clearSearchBtn.addEventListener('click', ()=>{ skillSelect.selectedIndex = -1; searchResult.textContent = ''; });

/* ---------- Init + seed UX ---------- */
if(!eduContainer.children.length) eduContainer.appendChild(makeEduEntry());
if(!projContainer.children.length) projContainer.appendChild(makeProjectEntry());
if(!workContainer.children.length) workContainer.appendChild(makeWorkEntry());

document.addEventListener('DOMContentLoaded', ()=> {
  // initial loads (global)
  loadAll();
  loadProjects(); // global project list
  loadSkills();   // global skills list
});
