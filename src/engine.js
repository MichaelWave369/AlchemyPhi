export const STORAGE_KEY = "alchemyphi-workbench-v1";
export const STAGE_COUNT = 7;
const LIMIT_HISTORY = 30;
const safeText = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
const cleanNotes = value => Array.from({length:STAGE_COUNT}, (_,i) => safeText(Array.isArray(value) ? value[i] : "", 12000));
const cleanDone = value => Array.from({length:STAGE_COUNT}, (_,i) => Array.isArray(value) && value[i] === true);
const validNumber = (number,min,max,fallback) => Number.isInteger(number) && number >= min && number <= max ? number : fallback;

export function initialState(){
  return {version:1,project:"",goal:"",lens:"systems",cycle:1,selected:0,notes:Array(STAGE_COUNT).fill(""),done:Array(STAGE_COUNT).fill(false),history:[]};
}

export function sanitizeSnapshot(raw){
  const base=initialState();
  if(!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const notes=cleanNotes(raw.notes);
  const done=cleanDone(raw.done).map((complete,i) => complete && notes[i].trim().length>0);
  const history=(Array.isArray(raw.history) ? raw.history.slice(-LIMIT_HISTORY) : [])
    .filter(item => item && typeof item === "object" && !Array.isArray(item))
    .map(item => ({
      cycle:validNumber(item.cycle,1,9999,1),
      project:safeText(item.project,160),
      goal:safeText(item.goal,1200),
      notes:cleanNotes(item.notes),
      completedAt:safeText(item.completedAt,40)
    }));
  return {
    ...base,
    project:safeText(raw.project,160),
    goal:safeText(raw.goal,1200),
    lens:["systems","human","matter"].includes(raw.lens) ? raw.lens : "systems",
    cycle:validNumber(raw.cycle,1,9999,1),
    selected:validNumber(raw.selected,0,6,0),
    notes,done,history
  };
}

export function completedCount(state){
  return state.done.filter(Boolean).length;
}

export function updateNote(state,index,text){
  if(!Number.isInteger(index) || index<0 || index>=STAGE_COUNT) return state;
  const notes=[...state.notes];
  notes[index]=safeText(text,12000);
  const done=[...state.done];
  if(!notes[index].trim()) done[index]=false;
  return {...state,notes,done};
}

export function completeStage(state,index){
  if(!Number.isInteger(index) || index<0 || index>=STAGE_COUNT || !state.notes[index].trim()) return state;
  const done=[...state.done];
  done[index]=true;
  return {...state,done,selected:Math.min(index+1,STAGE_COUNT-1)};
}

export function beginNextCycle(state,completedAt = new Date().toISOString()){
  if(completedCount(state)!==STAGE_COUNT) return state;
  const archived={cycle:state.cycle,project:state.project,goal:state.goal,notes:[...state.notes],completedAt};
  return {
    ...state,cycle:state.cycle+1,selected:0,
    notes:Array(STAGE_COUNT).fill(""),done:Array(STAGE_COUNT).fill(false),
    history:[...state.history,archived].slice(-LIMIT_HISTORY)
  };
}

export function exampleState(){
  const state=initialState();
  state.project="An offline-first knowledge garden";
  state.goal="A freely available library that works without an internet connection and helps people learn useful skills.";
  state.notes[0]="Remove account requirements, paywalls, and unnecessary dependencies. Keep offline access, useful content, and an inviting experience.";
  state.notes[1]="Break the concept into content packs, local search, reading paths, bookmarks, and sync as an optional later layer.";
  state.done[0]=true;
  state.done[1]=true;
  state.selected=2;
  return state;
}

export function toMarkdown(state,stages){
  const sections=[
    "# AlchemyPhi · Laboratory journal",
    "",
    "**Project:** "+(state.project||"Untitled"),
    "**Goal:** "+(state.goal||"Not specified"),
    "**Cycle:** "+state.cycle,
    "**Lens:** "+state.lens,
    ""
  ];
  stages.forEach((stage,i)=>{
    sections.push("## "+stage.roman+". "+stage.name,"",state.notes[i]||"_No notes yet._","","Status: "+(state.done[i]?"complete":"in progress"),"");
  });
  if(state.history.length){
    sections.push("---","","# Earlier cycles","");
    state.history.forEach(entry=>{
      sections.push("## Cycle "+entry.cycle+" · "+(entry.project||"Untitled"),"",entry.completedAt||"","");
      stages.forEach((stage,i)=>sections.push("### "+stage.name,"",entry.notes[i]||"_No notes._",""));
    });
  }
  return sections.join("\n");
}
