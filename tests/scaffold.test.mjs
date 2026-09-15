import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const required=['src/main.ts','manifest.json','styles.css','package.json','tsconfig.json','esbuild.config.mjs'];

test('plugin scaffold contains required build inputs',()=>{
  for(const file of required) assert.equal(existsSync(file),true,`${file} is required`);
});

test('manifest declares the Obsidian plugin id',()=>{
  const manifest=JSON.parse(readFileSync('manifest.json','utf8'));
  assert.equal(manifest.id,'obsidian-for-ai');
  assert.equal(manifest.isDesktopOnly,false);
});
