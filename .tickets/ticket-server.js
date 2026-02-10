#!/usr/bin/env node
/**
 * TicketOps Interactive Board
 * Usage: node ticket-server.js
 * Opens: http://localhost:3333
 *
 * Zero dependencies – uses only Node.js built-in modules.
 * Reads and writes .tickets/ directory directly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3333;
const TICKETS_DIR = path.join(process.cwd(), ".tickets");
const SPRINTS_FILE = path.join(TICKETS_DIR, "sprints.json");
const COUNTER_FILE = path.join(TICKETS_DIR, "COUNTER.txt");
const STATUSES = ["backlog", "active", "review", "done"];

// ── Helpers ────────────────────────────────────────────────

function ensureDirs() {
  for (const s of STATUSES) {
    const dir = path.join(TICKETS_DIR, s);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(path.join(TICKETS_DIR, "templates")))
    fs.mkdirSync(path.join(TICKETS_DIR, "templates"), { recursive: true });
  if (!fs.existsSync(COUNTER_FILE)) fs.writeFileSync(COUNTER_FILE, "001");
}

function getNextCounter() {
  let num = parseInt(fs.readFileSync(COUNTER_FILE, "utf8").trim()) || 1;
  const id = String(num).padStart(3, "0");
  fs.writeFileSync(COUNTER_FILE, String(num + 1).padStart(3, "0"));
  return id;
}

function getPrefix() {
  try {
    const proj = JSON.parse(
      fs.readFileSync(path.join(TICKETS_DIR, "projects.json"), "utf8")
    );
    return proj.settings?.default_project || "PP";
  } catch {
    return "PP";
  }
}

function makeSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function parseTicket(content, filename, status) {
  const fields = {};
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fmMatch) {
    fmMatch[1].split("\n").forEach((line) => {
      const m = line.match(/^(\w[\w_]*)\s*:\s*"?(.+?)"?\s*$/);
      if (m) fields[m[1]] = m[2].trim();
    });
  }

  // Extract description (Bug fix: \Z → $ for JS regex)
  let desc = "";
  const descMatch = content.match(
    /## (?:Beschreibung|Fehlerbeschreibung)\s*\n([\s\S]*?)(\n## |\n---|$)/
  );
  if (descMatch) desc = descMatch[1].trim();

  // Extract acceptance criteria (Bug fix: \Z → $ for JS regex)
  let criteria = [];
  const critMatch = content.match(
    /## Akzeptanzkriterien\s*\n([\s\S]*?)(\n## |\n---|$)/
  );
  if (critMatch) {
    criteria = critMatch[1]
      .split("\n")
      .filter((l) => l.match(/^- \[[ x]\]/))
      .map((l) => ({
        text: l.replace(/^- \[[ x]\]\s*/, ""),
        done: l.includes("[x]"),
      }));
  }

  // Extract full body after frontmatter (for detail view)
  let body = "";
  const bodyMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
  if (bodyMatch) body = bodyMatch[1].trim();

  return {
    id: fields.id || "",
    type: fields.type || "task",
    title: fields.title || filename.replace(".md", ""),
    status: status,
    priority: fields.priority || "medium",
    sprint: fields.sprint || "",
    branch: fields.branch || "",
    created: fields.created || "",
    updated: fields.updated || "",
    estimate: fields.estimate || "",
    desc,
    criteria,
    body,
    filename,
    raw: content,
  };
}

function getAllTickets() {
  ensureDirs();
  const tickets = [];
  for (const status of STATUSES) {
    const dir = path.join(TICKETS_DIR, status);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      tickets.push(parseTicket(content, file, status));
    }
  }
  return tickets;
}

function findTicketFile(id) {
  for (const status of STATUSES) {
    const dir = path.join(TICKETS_DIR, status);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.startsWith(id));
    if (files.length > 0) return { dir, file: files[0], status };
  }
  return null;
}

function buildTicketContent(data) {
  const today = new Date().toISOString().split("T")[0];
  const slug = makeSlug(data.title);
  const branch = `ticket/${data.id}-${slug}`;

  let md = `---
id: ${data.id}
type: ${data.type || "task"}
title: "${data.title}"
status: ${data.status || "backlog"}
priority: ${data.priority || "medium"}
sprint: ${data.sprint || ""}
branch: ${branch}
created: ${data.created || today}
updated: ${today}
estimate: ${data.estimate || ""}
---

# ${data.id}: ${data.title}

## Beschreibung
${data.desc || "<!-- Beschreibung hier -->"}

## Akzeptanzkriterien
`;

  if (data.criteria && data.criteria.length > 0) {
    for (const c of data.criteria) {
      md += `- [${c.done ? "x" : " "}] ${c.text}\n`;
    }
  } else {
    md += `- [ ] TODO: Kriterien definieren\n`;
  }

  md += `
## Notizen
<!-- Technische Details, Links, Screenshots -->

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| ${today} | Erstellt | Typ: ${data.type}, Prio: ${data.priority} |
`;
  return md;
}

function getSprints() {
  try {
    return JSON.parse(fs.readFileSync(SPRINTS_FILE, "utf8"));
  } catch {
    return { current_sprint: "foundation", sprints: {} };
  }
}

function saveSprints(data) {
  fs.writeFileSync(SPRINTS_FILE, JSON.stringify(data, null, 2));
}

// ── API Handlers ───────────────────────────────────────────

function handleApi(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  // GET /api/tickets
  if (p === "/api/tickets" && req.method === "GET") {
    return json(res, getAllTickets());
  }

  // POST /api/tickets
  if (p === "/api/tickets" && req.method === "POST") {
    return readBody(req, (body) => {
      const data = JSON.parse(body);
      const prefix = getPrefix();
      const num = getNextCounter();
      data.id = `${prefix}-${num}`;
      data.status = data.status || "backlog";
      const slug = makeSlug(data.title);
      const filename = `${data.id}-${slug}.md`;
      const content = buildTicketContent(data);
      const dir = path.join(TICKETS_DIR, data.status);
      fs.writeFileSync(path.join(dir, filename), content);
      return json(res, { ok: true, id: data.id, filename });
    });
  }

  // PUT /api/tickets/:id
  if (p.match(/^\/api\/tickets\/[A-Z]+-\d+$/) && req.method === "PUT") {
    const id = p.split("/").pop();
    return readBody(req, (body) => {
      const updates = JSON.parse(body);
      const found = findTicketFile(id);
      if (!found) return json(res, { error: "Not found" }, 404);

      const oldPath = path.join(found.dir, found.file);
      let content = fs.readFileSync(oldPath, "utf8");
      const today = new Date().toISOString().split("T")[0];

      // Update frontmatter fields
      for (const [key, val] of Object.entries(updates)) {
        if (
          [
            "type",
            "title",
            "priority",
            "sprint",
            "estimate",
            "status",
          ].includes(key)
        ) {
          const regex = new RegExp(`^${key}:.*$`, "m");
          const newVal = key === "title" ? `${key}: "${val}"` : `${key}: ${val}`;
          if (content.match(regex)) {
            content = content.replace(regex, newVal);
          }
        }
      }

      // Update description
      if (updates.desc !== undefined) {
        content = content.replace(
          /## Beschreibung\s*\n[\s\S]*?(\n## )/,
          `## Beschreibung\n${updates.desc}\n\n$1`
        );
      }

      // Update criteria
      if (updates.criteria) {
        const critText = updates.criteria
          .map((c) => `- [${c.done ? "x" : " "}] ${c.text}`)
          .join("\n");
        content = content.replace(
          /## Akzeptanzkriterien\s*\n[\s\S]*?(\n## )/,
          `## Akzeptanzkriterien\n${critText}\n\n$1`
        );
      }

      // Update timestamp
      content = content.replace(/^updated:.*$/m, `updated: ${today}`);

      // Add log entry if status changed
      if (updates.status && updates.status !== found.status) {
        const logEntry = `| ${today} | Status → ${updates.status} | Verschoben von ${found.status} |`;
        content = content.replace(
          /(\| Datum \| Aktion \| Details \|\n\|[-|]+\|)\n/,
          `$1\n${logEntry}\n`
        );
      }

      // Move file if status changed
      if (updates.status && updates.status !== found.status) {
        const newDir = path.join(TICKETS_DIR, updates.status);
        fs.writeFileSync(path.join(newDir, found.file), content);
        fs.unlinkSync(oldPath);
      } else {
        fs.writeFileSync(oldPath, content);
      }

      return json(res, { ok: true });
    });
  }

  // DELETE /api/tickets/:id
  if (p.match(/^\/api\/tickets\/[A-Z]+-\d+$/) && req.method === "DELETE") {
    const id = p.split("/").pop();
    const found = findTicketFile(id);
    if (!found) return json(res, { error: "Not found" }, 404);
    // Move to archive instead of deleting
    const archiveDir = path.join(TICKETS_DIR, "archive");
    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
    fs.renameSync(
      path.join(found.dir, found.file),
      path.join(archiveDir, found.file)
    );
    return json(res, { ok: true });
  }

  // GET /api/sprints
  if (p === "/api/sprints" && req.method === "GET") {
    return json(res, getSprints());
  }

  // PUT /api/sprints
  if (p === "/api/sprints" && req.method === "PUT") {
    return readBody(req, (body) => {
      saveSprints(JSON.parse(body));
      return json(res, { ok: true });
    });
  }

  return json(res, { error: "Not found" }, 404);
}

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req, cb) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => cb(body));
}

// ── HTML ───────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TicketOps Board</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f172a;--surface:#1e293b;--border:#334155;--text:#e2e8f0;--muted:#94a3b8;--dim:#64748b;--blue:#3b82f6;--green:#22c55e;--yellow:#f59e0b;--red:#ef4444;--purple:#a855f7}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
button{font-family:inherit;cursor:pointer;border:none;outline:none}
input,select,textarea{font-family:inherit;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:8px 10px;font-size:13px;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--blue)}
textarea{resize:vertical;min-height:60px}

/* Header */
.header{background:var(--surface);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.header h1{font-size:18px;font-weight:700;color:#f1f5f9;white-space:nowrap}
.header h1 .a{color:var(--blue)}
.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:1}
.btn{padding:7px 14px;border-radius:6px;font-size:13px;font-weight:500;transition:all .15s}
.btn-primary{background:var(--blue);color:#fff}
.btn-primary:hover{background:#2563eb}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--surface);color:var(--text)}
.btn-danger{background:#7f1d1d;color:#fca5a5}
.btn-danger:hover{background:#991b1b}
.btn-sm{padding:4px 8px;font-size:11px}

/* Stats */
.stats{display:flex;gap:16px;padding:10px 20px;background:var(--surface);border-bottom:1px solid var(--border);font-size:12px;color:var(--muted);flex-wrap:wrap}
.stat{display:flex;align-items:center;gap:4px}
.stat b{color:var(--text);font-size:15px}

/* Board */
.board{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;min-height:calc(100vh - 105px);align-items:start}
.col{background:var(--surface);border-radius:10px;border:1px solid var(--border);display:flex;flex-direction:column;max-height:calc(100vh - 120px);min-height:200px}
.col-head{padding:10px 14px;font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);border-radius:10px 10px 0 0;z-index:1}
.col-head .cnt{background:var(--border);color:var(--muted);font-size:11px;font-weight:500;padding:2px 7px;border-radius:10px}
.col-body{padding:6px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:6px;min-height:60px}
.col-body.drag-over{background:rgba(59,130,246,0.08);border-radius:0 0 10px 10px}

/* Cards */
.card{background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:10px;cursor:grab;transition:all .12s;border-left:3px solid transparent;position:relative}
.card:active{cursor:grabbing}
.card:hover{border-color:#475569;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.card.dragging{opacity:.4;transform:scale(.95)}
.card.p-critical{border-left-color:var(--red)}
.card.p-high{border-left-color:var(--yellow)}
.card.p-medium{border-left-color:var(--blue)}
.card.p-low{border-left-color:var(--dim)}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.card-id{font-size:11px;font-weight:600;color:var(--muted);font-family:'SF Mono',Consolas,monospace}
.badge{font-size:9px;padding:2px 5px;border-radius:3px;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.t-feature{background:#1e3a5f;color:#60a5fa}.t-bug{background:#5f1e1e;color:#f87171}
.t-task{background:#1e4d3a;color:#4ade80}.t-research{background:#4a1e5f;color:#c084fc}
.t-requirement{background:#5f4a1e;color:#fbbf24}.t-test{background:#1e5f5f;color:#2dd4bf}
.t-refactor{background:#3a3a1e;color:#a3e635}.t-docs,.t-chore{background:#2e2e2e;color:#a1a1aa}
.t-release{background:#1e3a5f;color:#38bdf8}
.card-title{font-size:13px;font-weight:500;color:#f1f5f9;line-height:1.3;margin-bottom:4px}
.card-meta{display:flex;gap:4px;flex-wrap:wrap}
.tag{font-size:9px;padding:2px 5px;border-radius:3px;background:var(--border);color:var(--muted);font-family:'SF Mono',Consolas,monospace}
.tag.sprint{border:1px solid #475569;background:transparent}
.empty{text-align:center;padding:24px 12px;color:#475569;font-size:12px}

/* Modal */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100;justify-content:center;align-items:flex-start;padding:40px 16px;overflow-y:auto}
.overlay.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:700px;padding:24px;animation:slideIn .15s ease;max-height:calc(100vh - 80px);overflow-y:auto}
@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
.modal h2{font-size:17px;margin-bottom:16px;color:#f1f5f9;display:flex;justify-content:space-between;align-items:center}
.modal-close{background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;padding:0 2px;line-height:1}
.modal-close:hover{color:#f1f5f9}
.form-row{margin-bottom:12px}
.form-row label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:500}
.form-row input,.form-row select,.form-row textarea{width:100%}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)}

/* Criteria editor */
.criteria-list{display:flex;flex-direction:column;gap:4px}
.crit-row{display:flex;gap:6px;align-items:center}
.crit-row input[type=checkbox]{width:16px;height:16px;accent-color:var(--blue)}
.crit-row input[type=text]{flex:1;font-size:12px;padding:5px 8px}
.crit-row .crit-del{background:none;border:none;color:var(--dim);font-size:16px;padding:0 4px;cursor:pointer}
.crit-row .crit-del:hover{color:var(--red)}
.add-crit{font-size:12px;color:var(--blue);background:none;border:none;cursor:pointer;padding:4px 0;text-align:left}
.add-crit:hover{text-decoration:underline}

/* Detail view */
.detail-view{margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:none}
.detail-view h3{font-size:14px;color:var(--blue);margin:16px 0 6px;font-weight:600}
.detail-view h3:first-child{margin-top:0}
.detail-view h4{font-size:13px;color:var(--text);margin:12px 0 4px;font-weight:600}
.detail-view p{font-size:12px;color:var(--muted);line-height:1.5;margin:2px 0}
.detail-view ul{font-size:12px;color:var(--muted);padding-left:16px;margin:4px 0}
.detail-view li{margin:2px 0;line-height:1.4}
.detail-view .checklist{list-style:none;padding-left:0}
.detail-view .check-item{display:flex;gap:6px;align-items:flex-start}
.detail-view .check-item.done{color:var(--green)}
.detail-view pre{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:11px;overflow-x:auto;margin:6px 0;white-space:pre-wrap}
.detail-view code{font-family:'SF Mono',Consolas,monospace;font-size:11px;background:var(--bg);padding:1px 4px;border-radius:3px}
.detail-view pre code{background:none;padding:0}
.detail-view table{width:100%;border-collapse:collapse;font-size:11px;margin:6px 0}
.detail-view td{border:1px solid var(--border);padding:4px 8px;color:var(--muted)}
.detail-view tr:first-child td{font-weight:600;color:var(--text);background:var(--bg)}
.detail-view strong{color:var(--text)}

/* Sprint bar */
.sprint-bar{display:flex;gap:8px;align-items:center;padding:8px 20px;background:var(--surface);border-bottom:1px solid var(--border);font-size:12px;flex-wrap:wrap}
.sprint-pill{padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .12s}
.sprint-pill:hover{border-color:#475569}
.sprint-pill.active{background:var(--blue);border-color:var(--blue);color:#fff}
.sprint-pill.s-done{background:#14532d;border-color:#166534;color:#4ade80}
.sprint-pill.s-active{background:#1e3a8a;border-color:#1d4ed8;color:#93c5fd}

/* Toast */
.toast{position:fixed;bottom:20px;right:20px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 16px;font-size:13px;color:var(--green);z-index:200;animation:fadeInUp .2s ease;box-shadow:0 4px 12px rgba(0,0,0,.4)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

@media(max-width:900px){.board{grid-template-columns:1fr 1fr}}
@media(max-width:500px){.board{grid-template-columns:1fr}}
</style>
</head>
<body>

<div class="header">
  <h1><span class="a">&#9635;</span> TicketOps</h1>
  <div class="controls">
    <input type="text" id="search" placeholder="Suchen..." style="width:160px" oninput="render()">
    <select id="fType" onchange="render()"><option value="">Alle Typen</option><option value="feature">Feature</option><option value="bug">Bug</option><option value="task">Task</option><option value="research">Research</option><option value="requirement">Req</option><option value="test">Test</option><option value="refactor">Refactor</option><option value="docs">Docs</option><option value="chore">Chore</option><option value="release">Release</option></select>
    <select id="fPrio" onchange="render()"><option value="">Alle Prios</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
    <button class="btn btn-primary" onclick="openCreate()">+ Ticket</button>
    <button class="btn btn-ghost" onclick="loadData()">&#8635; Refresh</button>
  </div>
</div>

<div class="sprint-bar" id="sprintBar"></div>
<div class="stats" id="stats"></div>
<div class="board" id="board"></div>

<!-- Create/Edit Modal -->
<div class="overlay" id="modal" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <h2 id="modalTitle">Neues Ticket<button class="modal-close" onclick="closeModal()">&times;</button></h2>
    <div class="form-row"><label>Titel *</label><input type="text" id="fTitle" placeholder="z.B. Survey Submit Endpoint"></div>
    <div class="form-grid">
      <div class="form-row"><label>Typ</label><select id="fTicketType"><option value="feature">Feature</option><option value="bug">Bug</option><option value="task" selected>Task</option><option value="research">Research</option><option value="requirement">Requirement</option><option value="test">Test</option><option value="refactor">Refactor</option><option value="docs">Docs</option><option value="chore">Chore</option><option value="release">Release</option></select></div>
      <div class="form-row"><label>Priorität</label><select id="fPriority"><option value="critical">Critical</option><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Sprint</label><select id="fSprint"></select></div>
      <div class="form-row"><label>Aufwand</label><input type="text" id="fEstimate" placeholder="z.B. 2h, 1d"></div>
    </div>
    <div class="form-row"><label>Beschreibung</label><textarea id="fDesc" rows="3" placeholder="Was soll gemacht werden?"></textarea></div>
    <div class="form-row"><label>Akzeptanzkriterien</label><div class="criteria-list" id="critList"></div><button class="add-crit" onclick="addCriterion()">+ Kriterium hinzufügen</button></div>
    <div class="form-actions">
      <button class="btn btn-danger" id="btnDelete" style="display:none;margin-right:auto" onclick="deleteTicket()">Löschen</button>
      <button class="btn btn-ghost" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" id="btnSave" onclick="saveTicket()">Erstellen</button>
    </div>
    <div class="detail-view" id="detailView"></div>
  </div>
</div>

<script>
let tickets=[], sprints={current_sprint:'',sprints:{}}, editId=null, sprintFilter='';
const cols={backlog:{l:'Backlog',c:'#64748b'},active:{l:'Active',c:'#3b82f6'},review:{l:'Review',c:'#f59e0b'},done:{l:'Done',c:'#22c55e'}};

async function api(path,opts={}){
  const r=await fetch(path,{headers:{'Content-Type':'application/json'},...opts});
  return r.json();
}

async function loadData(){
  tickets=await api('/api/tickets');
  sprints=await api('/api/sprints');
  renderSprintBar();
  render();
}

function renderSprintBar(){
  const el=document.getElementById('sprintBar');
  let h='<span style="color:var(--muted);margin-right:4px">Sprints:</span>';
  h+='<button class="sprint-pill'+(sprintFilter===''?' active':'')+'" onclick="sprintFilter=\\'\\';render()">Alle</button>';

  const sprintNames=Object.keys(sprints.sprints||{});
  // Also populate form select
  const sel=document.getElementById('fSprint');
  sel.innerHTML='<option value="">(kein Sprint)</option>';

  for(const key of sprintNames){
    const s=sprints.sprints[key];
    const isCurrent=key===sprints.current_sprint;
    let cls='sprint-pill';
    if(sprintFilter===key)cls+=' active';
    else if(s.status==='active')cls+=' s-active';
    else if(s.status==='done')cls+=' s-done';
    h+='<button class="'+cls+'" onclick="sprintFilter=\\''+key+'\\';render()">'+s.name+(isCurrent?' ◄':'')+'</button>';
    sel.innerHTML+='<option value="'+key+'"'+(isCurrent?' selected':'')+'>'+s.name+'</option>';
  }

  // Sprint actions
  const cur=sprints.sprints[sprints.current_sprint];
  if(cur){
    if(cur.status!=='active'){
      h+='<button class="btn btn-sm btn-primary" style="margin-left:auto" onclick="startSprint()">Sprint starten</button>';
    } else {
      h+='<button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="endSprint()">Sprint beenden</button>';
    }
  }
  el.innerHTML=h;
}

function render(){
  const q=document.getElementById('search').value.toLowerCase();
  const ft=document.getElementById('fType').value;
  const fp=document.getElementById('fPrio').value;

  const filtered={backlog:[],active:[],review:[],done:[]};
  let total=0;
  for(const t of tickets){
    if(q && !t.id.toLowerCase().includes(q) && !t.title.toLowerCase().includes(q) && !(t.desc||'').toLowerCase().includes(q)) continue;
    if(ft && t.type!==ft) continue;
    if(fp && t.priority!==fp) continue;
    if(sprintFilter && t.sprint!==sprintFilter) continue;
    filtered[t.status].push(t);
    total++;
  }

  // Stats
  let sh='<div class="stat"><b>'+total+'</b> Tickets</div>';
  for(const[s,m] of Object.entries(cols)) sh+='<div class="stat" style="color:'+m.c+'"><b>'+filtered[s].length+'</b> '+m.l+'</div>';
  document.getElementById('stats').innerHTML=sh;

  // Board
  let bh='';
  for(const[status,meta] of Object.entries(cols)){
    const tk=filtered[status];
    bh+='<div class="col"><div class="col-head" style="color:'+meta.c+'">'+meta.l+' <span class="cnt">'+tk.length+'</span></div>';
    bh+='<div class="col-body" id="col-'+status+'" ondragover="onDragOver(event)" ondragleave="onDragLeave(event)" ondrop="onDrop(event,\\''+status+'\\')">';
    if(!tk.length){bh+='<div class="empty">Keine Tickets</div>'}
    else for(const t of tk){
      let tags='';
      if(t.sprint)tags+='<span class="tag sprint">'+t.sprint+'</span>';
      if(t.estimate)tags+='<span class="tag">'+t.estimate+'</span>';
      bh+='<div class="card p-'+t.priority+'" draggable="true" ondragstart="onDragStart(event,\\''+t.id+'\\')" ondragend="onDragEnd(event)" onclick="openEdit(\\''+t.id+'\\')">';
      bh+='<div class="card-top"><span class="card-id">'+t.id+'</span><span class="badge t-'+t.type+'">'+t.type+'</span></div>';
      bh+='<div class="card-title">'+esc(t.title)+'</div>';
      if(tags)bh+='<div class="card-meta">'+tags+'</div>';
      bh+='</div>';
    }
    bh+='</div></div>';
  }
  document.getElementById('board').innerHTML=bh;
}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ── Drag & Drop ──────────────────────────────────────────
let dragId=null;
function onDragStart(e,id){dragId=id;e.target.classList.add('dragging');e.dataTransfer.effectAllowed='move'}
function onDragEnd(e){dragId=null;e.target.classList.remove('dragging');document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'))}
function onDragOver(e){e.preventDefault();e.currentTarget.classList.add('drag-over')}
function onDragLeave(e){e.currentTarget.classList.remove('drag-over')}
async function onDrop(e,newStatus){
  e.preventDefault();e.currentTarget.classList.remove('drag-over');
  if(!dragId)return;
  const t=tickets.find(x=>x.id===dragId);
  if(!t||t.status===newStatus)return;
  await api('/api/tickets/'+dragId,{method:'PUT',body:JSON.stringify({status:newStatus})});
  toast(dragId+' → '+newStatus);
  await loadData();
}

// ── Create / Edit ────────────────────────────────────────
function resetForm(){
  editId=null;
  document.getElementById('fTitle').value='';
  document.getElementById('fTicketType').value='task';
  document.getElementById('fPriority').value='medium';
  document.getElementById('fSprint').value=sprints.current_sprint||'';
  document.getElementById('fEstimate').value='';
  document.getElementById('fDesc').value='';
  document.getElementById('critList').innerHTML='';
  document.getElementById('btnDelete').style.display='none';
  document.getElementById('btnSave').textContent='Erstellen';
  document.getElementById('modalTitle').innerHTML='Neues Ticket<button class="modal-close" onclick="closeModal()">&times;</button>';
  document.getElementById('detailView').innerHTML='';
  document.getElementById('detailView').style.display='none';
}

function openCreate(){
  resetForm();
  addCriterion();addCriterion();addCriterion();
  document.getElementById('modal').classList.add('open');
  document.getElementById('fTitle').focus();
}

function openEdit(id){
  const t=tickets.find(x=>x.id===id);
  if(!t)return;
  editId=id;
  document.getElementById('fTitle').value=t.title;
  document.getElementById('fTicketType').value=t.type;
  document.getElementById('fPriority').value=t.priority;
  document.getElementById('fSprint').value=t.sprint;
  document.getElementById('fEstimate').value=t.estimate||'';
  document.getElementById('fDesc').value=t.desc||'';
  document.getElementById('critList').innerHTML='';
  if(t.criteria&&t.criteria.length){
    t.criteria.forEach(c=>addCriterion(c.text,c.done));
  } else {addCriterion();addCriterion()}
  document.getElementById('btnDelete').style.display='inline-block';
  document.getElementById('btnSave').textContent='Speichern';
  document.getElementById('modalTitle').innerHTML=t.id+' bearbeiten<button class="modal-close" onclick="closeModal()">&times;</button>';
  // Populate detail view with remaining sections
  var detailMd=getDetailSections(t);
  var detailEl=document.getElementById('detailView');
  if(detailMd){detailEl.innerHTML=renderMarkdown(detailMd);detailEl.style.display='block'}
  else{detailEl.innerHTML='';detailEl.style.display='none'}
  document.getElementById('modal').classList.add('open');
}

function closeModal(){document.getElementById('modal').classList.remove('open');editId=null}

function addCriterion(text,done){
  const list=document.getElementById('critList');
  const row=document.createElement('div');row.className='crit-row';
  row.innerHTML='<input type="checkbox"'+(done?' checked':'')+'><input type="text" placeholder="Kriterium..." value="'+(text?esc(text):'')+'"><button class="crit-del" onclick="this.parentElement.remove()">&times;</button>';
  list.appendChild(row);
}

function getCriteria(){
  const rows=document.querySelectorAll('#critList .crit-row');
  const out=[];
  rows.forEach(r=>{
    const text=r.querySelector('input[type=text]').value.trim();
    if(text)out.push({text,done:r.querySelector('input[type=checkbox]').checked});
  });
  return out;
}

async function saveTicket(){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){document.getElementById('fTitle').style.borderColor='var(--red)';return}

  const data={
    title,
    type:document.getElementById('fTicketType').value,
    priority:document.getElementById('fPriority').value,
    sprint:document.getElementById('fSprint').value,
    estimate:document.getElementById('fEstimate').value.trim(),
    desc:document.getElementById('fDesc').value.trim(),
    criteria:getCriteria()
  };

  if(editId){
    await api('/api/tickets/'+editId,{method:'PUT',body:JSON.stringify(data)});
    toast(editId+' gespeichert');
  } else {
    const res=await api('/api/tickets',{method:'POST',body:JSON.stringify(data)});
    toast(res.id+' erstellt');
  }
  closeModal();
  await loadData();
}

async function deleteTicket(){
  if(!editId)return;
  if(!confirm(editId+' wirklich archivieren?'))return;
  await api('/api/tickets/'+editId,{method:'DELETE'});
  toast(editId+' archiviert');
  closeModal();
  await loadData();
}

// ── Sprint Actions ───────────────────────────────────────
async function startSprint(){
  const cur=sprints.current_sprint;
  const s=sprints.sprints[cur];
  if(!s)return;
  s.status='active';
  s.start_date=new Date().toISOString().split('T')[0];
  await api('/api/sprints',{method:'PUT',body:JSON.stringify(sprints)});
  toast('Sprint gestartet: '+s.name);
  await loadData();
}

async function endSprint(){
  const cur=sprints.current_sprint;
  const s=sprints.sprints[cur];
  if(!s)return;
  const open=tickets.filter(t=>t.sprint===cur&&t.status!=='done').length;
  const done=tickets.filter(t=>t.sprint===cur&&t.status==='done').length;
  if(!confirm('Sprint "'+s.name+'" beenden?\\n\\nDone: '+done+' Tickets\\nOffen: '+open+' Tickets'))return;
  s.status='done';
  s.end_date=new Date().toISOString().split('T')[0];
  // Auto-advance to next sprint
  const keys=Object.keys(sprints.sprints);
  const idx=keys.indexOf(cur);
  if(idx<keys.length-1)sprints.current_sprint=keys[idx+1];
  await api('/api/sprints',{method:'PUT',body:JSON.stringify(sprints)});
  toast('Sprint beendet: '+s.name);
  await loadData();
}

// ── Toast ────────────────────────────────────────────────
function toast(msg){
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),300)},2000);
}

// ── Markdown Rendering ───────────────────────────────
function inlineMd(text){
  return esc(text)
    .replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
    .replace(/\`([^\`]+?)\`/g,'<code>$1</code>');
}

function renderMarkdown(md){
  if(!md)return '';
  var html='',inCode=false,inTable=false,inList=false;
  var lines=md.split('\\n');
  for(var i=0;i<lines.length;i++){
    var line=lines[i];
    if(line.startsWith('\`\`\`')){
      if(inCode){html+='</code></pre>';inCode=false}
      else{if(inList){html+='</ul>';inList=false}if(inTable){html+='</table>';inTable=false}html+='<pre><code>';inCode=true}
      continue;
    }
    if(inCode){html+=esc(line)+'\\n';continue}
    if(line.match(/^\\|.*\\|\\s*$/)){
      if(line.match(/^\\|[\\s-:|]+\\|\\s*$/))continue;
      if(!inTable){if(inList){html+='</ul>';inList=false}html+='<table>';inTable=true}
      var cells=line.split('|').filter(function(c){return c.trim()});
      html+='<tr>'+cells.map(function(c){return '<td>'+inlineMd(c.trim())+'</td>'}).join('')+'</tr>';
      continue;
    }else if(inTable){html+='</table>';inTable=false}
    if(line.startsWith('### ')){if(inList){html+='</ul>';inList=false}html+='<h4>'+inlineMd(line.slice(4))+'</h4>';continue}
    if(line.startsWith('## ')){if(inList){html+='</ul>';inList=false}html+='<h3>'+inlineMd(line.slice(3))+'</h3>';continue}
    if(line.match(/^- \\[[ x]\\]/)){
      if(!inList){html+='<ul class="checklist">';inList=true}
      var checked=line.includes('[x]');
      var text=line.replace(/^- \\[[ x]\\]\\s*/,'');
      html+='<li class="check-item'+(checked?' done':'')+'">'+(checked?'\\u2611':'\\u2610')+' '+inlineMd(text)+'</li>';
      continue;
    }
    if(line.match(/^[-*]\\s/)){
      if(!inList){html+='<ul>';inList=true}
      html+='<li>'+inlineMd(line.replace(/^[-*]\\s+/,''))+'</li>';
      continue;
    }else if(inList&&line.trim()===''){html+='</ul>';inList=false}
    if(line.match(/^\\d+\\.\\s/)){html+='<p>'+inlineMd(line)+'</p>';continue}
    if(line.trim()==='')continue;
    html+='<p>'+inlineMd(line)+'</p>';
  }
  if(inList)html+='</ul>';
  if(inTable)html+='</table>';
  if(inCode)html+='</code></pre>';
  return html;
}

function getDetailSections(ticket){
  if(!ticket.body)return '';
  var sections=ticket.body.split(/\\n(?=## )/);
  var skip=['Beschreibung','Fehlerbeschreibung','Akzeptanzkriterien'];
  var md='';
  for(var s=0;s<sections.length;s++){
    var sec=sections[s];
    if(sec.match(/^# [^#]/))continue;
    var heading=sec.match(/^## (.+)/);
    if(heading&&skip.indexOf(heading[1].trim())>=0)continue;
    md+=sec+'\\n\\n';
  }
  return md.trim();
}

// ── Keyboard ─────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if(e.key==='n'&&!e.ctrlKey&&!e.metaKey&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'&&document.activeElement.tagName!=='SELECT'&&!document.getElementById('modal').classList.contains('open'))openCreate();
});

// Init
loadData();
</script>
</body>
</html>`;

// ── Server ─────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) return handleApi(req, res);

  // Serve HTML
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(HTML);
});

ensureDirs();

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log("");
  console.log("  ┌─────────────────────────────────────┐");
  console.log("  │   TicketOps Board                    │");
  console.log(`  │   ${url}                │`);
  console.log("  │   Ctrl+C zum Beenden                 │");
  console.log("  └─────────────────────────────────────┘");
  console.log("");

  // Auto-open browser
  const { exec } = require("child_process");
  const cmd =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
      ? `open ${url}`
      : `xdg-open ${url}`;
  exec(cmd);
});
