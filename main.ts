// Leonida Legend — the entry program for gta6-trophy-guide-01.
// Node 22, standard library only. It copies this repository's app/ and
// screenshots/ into the output directory and writes dossier.json with the
// kit's vendored library, so the judge can read the guide from one file.
// Run locally as: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (in the grader's container MAKEFUN_OUTPUT_DIR is unset and /output is used).
// vendor/makefun-frontend.ts is the kit's copy and must stay unchanged:
// the scorer rebuilds the dossier with its own copy and compares bytes.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own limits: at most 4 screenshots, each at
// most 256 KiB; app/ at most 993 files and directories and 48 MiB in all,
// so the whole of /output stays under its 1,000-entry, 64 MiB ceiling.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
