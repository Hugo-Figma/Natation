import { createTypstCompiler } from '@myriaddreamin/typst.ts';
import { CompileFormatEnum } from '@myriaddreamin/typst.ts/compiler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const template = fs.readFileSync('./src/typst/workout-template.typ', 'utf8');
const wasmPath = path.join('./node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm');

const main = `
#import "/workout-template.typ": render-workout
#show: doc => render-workout((
  name: "Test",
  type: "Endurance",
  "created-at": "2024-01-01",
  "total-distance": 100,
  sections: ((
    title: "T",
    comment: "c",
    exercises: ((
      description: "d",
      distance: "100m",
      type: "warmup",
      unit: "m",
    ),)
  ),)
))
`;

const run = async () => {
  const compiler = createTypstCompiler();
  await compiler.init({ getModule: () => fs.promises.readFile(wasmPath).then(b=>b.buffer) });
  compiler.addSource('/workout-template.typ', template);
  compiler.addSource('/main.typ', main);
  const res = await compiler.compile({ mainFilePath: '/main.typ', format: CompileFormatEnum.pdf });
  console.log('result', res.result ? 'ok' : 'fail');
  if (!res.result) {
    console.log(res.diagnostics);
  }
};

run().catch(err => { console.error(err); process.exit(1); });
