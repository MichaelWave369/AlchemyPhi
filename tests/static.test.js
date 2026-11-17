import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {STAGES,LENSES} from "../src/data.js";

test("every UI element referenced by app.js exists in the page",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  const referenced=[...app.matchAll(/byId\("([^"]+)"\)/g)].map(match=>match[1]);
  assert.ok(referenced.length>=20,"expected multiple DOM references");
  for(const id of referenced)assert.ok(ids.has(id),"Missing DOM element: "+id);
});

test("seven stages have unique names and all three interpretive lenses",()=>{
  assert.equal(STAGES.length,7);
  assert.equal(new Set(STAGES.map(stage=>stage.name)).size,7);
  assert.deepEqual(Object.keys(LENSES).sort(),["human","matter","systems"]);
  for(const stage of STAGES){
    assert.ok(stage.matter.length>20);
    for(const lens of ["systems","human","matterLens"]){
      assert.ok(stage[lens].description.length>20);
      assert.ok(stage[lens].question.length>20);
      assert.ok(stage[lens].hint.length>15);
    }
  }
});
