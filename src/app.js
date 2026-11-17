import {STAGES,LENSES} from "./data.js";
import {STORAGE_KEY,initialState,sanitizeSnapshot,completedCount,updateNote,completeStage,beginNextCycle,exampleState,toMarkdown} from "./engine.js";

const byId = id => document.getElementById(id);
const nodes = {
  methodList:byId("methodList"),stageRail:byId("stageRail"),progressCount:byId("progressCount"),progressFill:byId("progressFill"),
  project:byId("projectName"),goal:byId("projectGoal"),lens:byId("lensSelect"),cycleLabel:byId("cycleLabel"),
  operationLabel:byId("operationLabel"),stageStatus:byId("stageStatus"),symbol:byId("operationSymbol"),
  subtitle:byId("activeSubtitle"),title:byId("activeTitle"),description:byId("activeDescription"),
  question:byId("activeQuestion"),hint:byId("activeHint"),journal:byId("journal"),charCount:byId("charCount"),
  previous:byId("previousButton"),complete:byId("completeButton"),finished:byId("cycleCompleted"),nextCycle:byId("nextCycleButton"),
  demo:byId("demoButton"),export:byId("exportButton"),markdown:byId("markdownButton"),
  importButton:byId("importButton"),importInput:byId("importInput"),reset:byId("resetButton"),
  historyCount:byId("historyCount"),historyList:byId("historyList"),toast:byId("toast")
};
let state = load();
let toastTimer;
function load(){
  try{return sanitizeSnapshot(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));}
  catch{return initialState();}
}
function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch{notify("Local storage unavailable. Export your work to keep it safe.");}
}
function notify(message){
  nodes.toast.textContent=message;
  nodes.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>nodes.toast.classList.remove("visible"),3600);
}
function currentLens(stage){
  return state.lens==="matter" ? stage.matterLens : stage[state.lens];
}
function makeMethodList(){
  nodes.methodList.innerHTML=STAGES.map(stage=>
    '<a href="#laboratory" class="method-item" data-method="'+STAGES.indexOf(stage)+'">'+
    '<span class="method-roman">'+stage.roman+'</span><h3>'+stage.name+'</h3>'+
    '<p>'+stage.short+'</p></a>'
  ).join("");
}
function renderRail(){
  nodes.stageRail.innerHTML=STAGES.map((stage,i)=>
    '<button type="button" data-step="'+i+'" class="step-button'+
    (i===state.selected?' is-active':'')+(state.done[i]?' is-done':'')+
    '" aria-label="Operation '+(i+1)+': '+stage.name+(state.done[i]?', completed':'')+'"'+
    (i===state.selected?' aria-current="step"':'')+'>'+
    '<span class="step-number">'+(state.done[i]?'✓':stage.roman)+'</span>'+
    '<span class="step-text">'+stage.name+'</span></button>'
  ).join("");
}
function renderHistory(){
  nodes.historyCount.textContent=String(state.history.length);
  nodes.historyList.replaceChildren();
  if(!state.history.length){
    const p=document.createElement("p");
    p.className="history-list-empty";
    p.textContent="No completed cycles archived yet.";
    nodes.historyList.append(p);
    return;
  }
  [...state.history].reverse().forEach(entry=>{
    const details=document.createElement("details");
    details.className="history-entry";
    const summary=document.createElement("summary");
    summary.textContent="Cycle "+entry.cycle+" · "+(entry.project||"Untitled project");
    details.append(summary);
    const date=document.createElement("p");
    date.textContent=entry.completedAt ? "Archived: "+entry.completedAt : "Archived cycle";
    details.append(date);
    STAGES.forEach((stage,index)=>{
      const p=document.createElement("p");
      const strong=document.createElement("strong");
      strong.textContent=stage.name+": ";
      p.append(strong,document.createTextNode(entry.notes[index] || "No notes."));
      details.append(p);
    });
    nodes.historyList.append(details);
  });
}
function render(){
  const stage=STAGES[state.selected];
  const lens=currentLens(stage);
  const count=completedCount(state);
  nodes.project.value=state.project;
  nodes.goal.value=state.goal;
  nodes.lens.value=state.lens;
  nodes.cycleLabel.textContent="CYCLE "+String(state.cycle).padStart(2,"0");
  nodes.progressCount.textContent=count+" of 7 refined";
  nodes.progressFill.style.width=(count/7*100)+"%";
  nodes.operationLabel.textContent="OPERATION "+stage.roman+" · "+String(state.selected+1).padStart(2,"0")+" / 07";
  nodes.stageStatus.textContent=state.done[state.selected] ? "REFINED ✓" : "IN PROCESS";
  nodes.symbol.textContent=stage.symbol;
  nodes.subtitle.textContent=stage.subtitle+" · "+LENSES[state.lens];
  nodes.title.textContent=stage.name;
  nodes.description.textContent=state.lens==="matter" ? stage.matterLens.description+" "+stage.matter : lens.description;
  nodes.question.textContent=lens.question;
  nodes.hint.textContent=lens.hint;
  nodes.journal.value=state.notes[state.selected];
  nodes.charCount.textContent=nodes.journal.value.length+" characters";
  nodes.previous.disabled=state.selected===0;
  nodes.complete.disabled=!state.notes[state.selected].trim();
  nodes.complete.textContent=state.done[state.selected] ?
    (state.selected===6?"Cycle reviewed ✓":"Next operation →") :
    (state.selected===6?"Complete final operation ✓":"Complete & continue →");
  nodes.finished.hidden=count!==7;
  renderRail();
  renderHistory();
}
nodes.methodList.addEventListener("click",event=>{
  const item=event.target.closest("[data-method]");
  if(!item)return;
  state={...state,selected:Number(item.dataset.method)};
  persist();render();
});
nodes.stageRail.addEventListener("click",event=>{
  const button=event.target.closest("[data-step]");
  if(!button)return;
  state={...state,selected:Number(button.dataset.step)};
  persist();render();
});
nodes.project.addEventListener("input",event=>{state={...state,project:event.target.value};persist();});
nodes.goal.addEventListener("input",event=>{state={...state,goal:event.target.value};persist();});
nodes.lens.addEventListener("change",event=>{state={...state,lens:event.target.value};persist();render();});
nodes.journal.addEventListener("input",event=>{
  state=updateNote(state,state.selected,event.target.value);
  nodes.charCount.textContent=nodes.journal.value.length+" characters";
  nodes.complete.disabled=!nodes.journal.value.trim();
  persist();
});
nodes.previous.addEventListener("click",()=>{
  state={...state,selected:Math.max(0,state.selected-1)};
  persist();render();
});
nodes.complete.addEventListener("click",()=>{
  if(state.done[state.selected]){
    if(state.selected<6){state={...state,selected:state.selected+1};persist();render();}
    else {nodes.finished.scrollIntoView({behavior:"smooth",block:"nearest"});}
    return;
  }
  const before=completedCount(state);
  state=completeStage(state,state.selected);
  if(completedCount(state)===before) return;
  persist();render();
  if(completedCount(state)===7) notify("All seven operations complete. Begin another cycle when ready.");
  else notify("Operation refined. Moving to the next stage.");
});
nodes.nextCycle.addEventListener("click",()=>{
  state=beginNextCycle(state);
  persist();render();
  notify("Cycle archived. The next cycle begins.");
});
nodes.demo.addEventListener("click",()=>{
  if((state.project || state.notes.some(Boolean) || state.history.length) &&
     !confirm("Replace the current workspace with an example? Export first if you want a backup."))return;
  state=exampleState();persist();render();notify("Example loaded. Explore operation III.");
});
nodes.reset.addEventListener("click",()=>{
  if(!confirm("Start a blank project? This clears the current project AND its archived cycles from this browser. Export first to preserve them."))return;
  state=initialState();persist();render();notify("Blank workspace ready.");
});
function download(text,filename,type){
  const file=new Blob([text],{type});
  const url=URL.createObjectURL(file);
  const link=document.createElement("a");
  link.href=url;
  link.download=filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
const filename=ext=>"AlchemyPhi-cycle-"+state.cycle+"."+ext;
nodes.export.addEventListener("click",()=>{
  download(JSON.stringify(state,null,2),filename("json"),"application/json");
  notify("Workspace exported as JSON.");
});
nodes.markdown.addEventListener("click",()=>{
  download(toMarkdown(state,STAGES),filename("md"),"text/markdown");
  notify("Journal exported as Markdown.");
});
nodes.importButton.addEventListener("click",()=>nodes.importInput.click());
nodes.importInput.addEventListener("change",async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  try{
    if(file.size>2_000_000)throw new Error("File exceeds the 2 MB import limit.");
    const raw=JSON.parse(await file.text());
    if(!raw || raw.version!==1 || !Array.isArray(raw.notes) || raw.notes.length!==7)throw new Error("Not an AlchemyPhi v1 workspace export.");
    if(!confirm("Import this workspace? It will replace your current local project and archives."))return;
    state=sanitizeSnapshot(raw);persist();render();notify("Workspace imported.");
  }catch(error){notify("Import failed: "+error.message);}
  finally{event.target.value="";}
});
makeMethodList();
render();
