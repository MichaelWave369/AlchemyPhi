import test from "node:test";
import assert from "node:assert/strict";
import {initialState,sanitizeSnapshot,completedCount,updateNote,completeStage,beginNextCycle,exampleState,toMarkdown} from "../src/engine.js";

test("starts with seven empty stages",()=>{
  const state=initialState();
  assert.equal(state.notes.length,7);
  assert.equal(completedCount(state),0);
  assert.equal(state.selected,0);
});
test("cannot finish an empty stage",()=>{
  const state=initialState();
  assert.equal(completeStage(state,0),state);
});
test("completes notes and advances; blanking notes revokes completion",()=>{
  let state=updateNote(initialState(),0,"Remove excess");
  state=completeStage(state,0);
  assert.equal(state.selected,1);
  assert.equal(completedCount(state),1);
  state=updateNote(state,0," ");
  assert.equal(completedCount(state),0);
});
test("cycle archives all seven stages without losing project name",()=>{
  let state=initialState();
  state.project="Open knowledge garden";
  for(let i=0;i<7;i++) state=completeStage(updateNote(state,i,"Step "+i),i);
  assert.equal(completedCount(state),7);
  state=beginNextCycle(state,"2026-01-01T00:00:00Z");
  assert.equal(state.cycle,2);
  assert.equal(state.history.length,1);
  assert.equal(state.history[0].project,"Open knowledge garden");
  assert.equal(state.history[0].notes[6],"Step 6");
  assert.equal(completedCount(state),0);
});
test("cannot archive an unfinished cycle",()=>{
  const state=initialState();
  assert.equal(beginNextCycle(state),state);
});
test("sanitizes malformed or hostile import payloads",()=>{
  const state=sanitizeSnapshot({
    project:2,lens:"attack",selected:999,cycle:-1,
    notes:["safe",null],done:[true,true],
    history:[null,{cycle:1,project:"Earlier",notes:["Archive"]}]
  });
  assert.equal(state.project,"");
  assert.equal(state.lens,"systems");
  assert.equal(state.selected,0);
  assert.deepEqual(state.done,[true,false,false,false,false,false,false]);
  assert.equal(state.history.length,1);
  assert.equal(state.history[0].notes[0],"Archive");
});
test("demo presents two completed operations and a third pending",()=>{
  const state=exampleState();
  assert.equal(completedCount(state),2);
  assert.equal(state.selected,2);
});
test("markdown export includes journal text and historical stage names",()=>{
  const state=exampleState();
  const result=toMarkdown(state,[{name:"Calcination",roman:"I"},...Array.from({length:6},(_,i)=>({name:"Stage"+i,roman:"II"}))]);
  assert.match(result,/offline-first knowledge garden/);
  assert.match(result,/Calcination/);
  assert.match(result,/Remove account requirements/);
});
