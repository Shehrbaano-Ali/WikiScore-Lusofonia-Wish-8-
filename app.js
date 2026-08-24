const PROXY = "https://corsproxy.io/?url="; 
const badgeRules = [
    { pts: 25,   img: "badge_50.jpg",   rank: "Level 1" },
    { pts: 50,   img: "badge_200.jpg",  rank: "Level 2" },
    { pts: 150,  img: "badge_500.jpg",  rank: "Level 3" },
    { pts: 300,  img: "badge_1000.png", rank: "Level 4" },
    { pts: 600,  img: "badge_2000.png", rank: "Level 5" },
    { pts: 1000, img: "badge_3000.png", rank: "Level 6" }
];

    // Below is the names list of the participants

const backupList = [
    { name: "Aleksey Bolger" }, { name: "Alethos2026" }, { name: "AmandaLDS" },
    { name: "Ana Beatriz Valenza de Oliveira" }, { name: "Ana Clara Ozório" },
    { name: "Angelo Miranda" }, { name: "Anna Karenina Bittencourt" },
    { name: "Antinio luiz marcone" }, { name: "Antonia Luz" }, { name: "Aquila Leite" },
    { name: "Aren Noronha" }, { name: "Astralwikipage" }, { name: "BabiAudio" },
    { name: "BeCarol13" }, { name: "BrasileiroMedio" }, { name: "CacaisKacic" },
    { name: "Camila 03 camila" }, { name: "Camilarg" }, { name: "Cati659320" },
    { name: "Ciriice" }, { name: "ClaudiaWanderley" }, { name: "CorreiaThu" },
    { name: "CozDoc1" }, { name: "Cristalima" }, { name: "DamasSemGambitos" },
    { name: "Dan Poletti" }, { name: "Danlessa" }, { name: "Davi Moura" },
    { name: "Diegofoz79" }, { name: "Editor wiki 210855" }, { name: "Edwatanabe" },
    { name: "Eztevao" }, { name: "Fabiotwotwo" }, { name: "Fadieira" },
    { name: "FDias (WMB)" }, { name: "Fredericknoronha" }, { name: "Gabrielfv07" },
    { name: "Gal Ribeiro" }, { name: "Galbes" }, { name: "Garbezg" },
    { name: "Gisele333" }, { name: "GreenLuz" }, { name: "Heatherladue700" },
    { name: "Hellidy" }, { name: "Heloiusa" }, { name: "HestevezSidnei" },
    { name: "Heylenny" }, { name: "Humanisciente" }, { name: "Ida Rebelo" },
    { name: "Iriskacic" }, { name: "Jessica Rocha S" }, { name: "Josias silva2026" },
    { name: "João Francisco Milani" }, { name: "Katharzl" }, { name: "Lgeolog" },
    { name: "Lilian viana" }, { name: "MARIA LIMA DA CRUZ" }, { name: "Mi.minreal" },
    { name: "Minerva97" }, { name: "Moisés8" }, { name: "Moonrib" },
    { name: "MPMrocha" }, { name: "Naiara Talita Teixeira" }, { name: "OfGodAndVoid" },
    { name: "Olivia1991" }, { name: "Ori Fonseca" }, { name: "Overmundo" },
    { name: "PaivaClarissa" }, { name: "PaulaSimoes" }, { name: "PedroBrito123" },
    { name: "Plurabilities" }, { name: "PoeiradeEstrela" }, { name: "Ppulbatu" },
    { name: "Ricardosdag" }, { name: "Robertgeek" }, { name: "Romerlrl" },
    { name: "RonaldoNunes20" }, { name: "Ruy Bandeira Neto" }, { name: "Sacardoso" },
    { name: "SanVincius" }, { name: "SilYKC" }, { name: "Sim2317" },
    { name: "Sintegrity" }, { name: "Ssstela" }, { name: "Sunmanu" },
    { name: "SunnySal Editor" }, { name: "Sérgio Machado da Silva Gomes" },
    { name: "TagFroes" }, { name: "TamiresAnsanelo" }, { name: "Thaismay" },
    { name: "TiaLara" }, { name: "Túllio F" }, { name: "UnrealUnearth" },
    { name: "Valter Correa" }, { name: "VictorAyabe" }, { name: "Viviane Martins de Oliveira" },
    { name: "Wanessa123456789" }, { name: "XeloKai" }
];

let participants = [];
let currentSort = "desc";
const CONCURRENCY_LIMIT = 5;

let weights = { l: 2, d: 3, f: 5, r: 4, i: 5 };
let dateRange = { start: "2026-04-01", end: "2026-04-30" };
let scannedProgress = 0;
let showBots = false;

function getEarnedBadges(score) { return badgeRules.filter(r => score >= r.pts).reverse(); }

async function validateBatch(revids) {
    if (revids.length === 0) return {};
    const idsString = revids.join('|');
    const url = `https://www.wikidata.org/w/api.php?action=query&prop=revisions&revids=${idsString}&rvprop=tags|ids&format=json&origin=*`;
    try {
        const res = await fetch(PROXY + encodeURIComponent(url));
        const data = await res.json();
        const validityMap = {};
        if (data.query && data.query.pages) {
            Object.values(data.query.pages).forEach(p => {
                if (p.revisions) p.revisions.forEach(r => validityMap[r.revid] = !r.tags.includes('mw-reverted'));
            });
        }
        return validityMap;
    } catch { return {}; }
}

async function fetchScore(editor) {
    const apiStart = `${dateRange.end}T23:59:59Z`;
    const apiEnd = `${dateRange.start}T00:00:00Z`;
    let uccontinue = null;
    let sPT = 0, sGL = 0, l = 0, d = 0, f = 0, r = 0, img = 0, revCount = 0;
    let botFound = false;
    let lastItem = "---"; // Here I added a Item Tracking

    try {
        while (true) {
            let url = `https://www.wikidata.org/w/api.php?action=query&list=usercontribs&ucuser=${encodeURIComponent(editor.name)}&ucstart=${apiStart}&ucend=${apiEnd}&uclimit=500&ucprop=comment|ids|flags&format=json&origin=*`;
            if (uccontinue) url += `&uccontinue=${uccontinue}`;

            const res = await fetch(PROXY + encodeURIComponent(url));
            const data = await res.json();
            const edits = data.query.usercontribs || [];
            
            const allIds = edits.map(e => e.revid);
            let validityMap = {};
            for (let i = 0; i < allIds.length; i += 50) {
                const result = await validateBatch(allIds.slice(i, i + 50));
                validityMap = { ...validityMap, ...result };
            }

            edits.forEach(e => {
                if (e.hasOwnProperty('bot')) { botFound = true; return; }
                if (validityMap[e.revid] === false) { revCount++; return; }

                const c = e.comment || "";
                
                // I captured the QID from the comment
                const qidMatch = c.match(/Q\d+/);
                if (qidMatch && lastItem === "---") lastItem = qidMatch[0];

                const isPtDialect = /\|pt(-br)?/.test(c);

                if (c.includes('P18')) { sGL += weights.i; img++; }
                else if (c.includes('wbsetclaim-create')) { sGL += weights.f; f++; }
                else if (c.includes('wbsetreference-add')) { sGL += weights.r; r++; }
                else if (c.includes('wbsetlabel')) {
                    if (isPtDialect) { sPT += weights.l; l++; }
                    else { sGL += weights.l; l++; }
                }
                else if (c.includes('wbsetdescription')) {
                    if (isPtDialect) { sPT += weights.d; d++; }
                    else { sGL += weights.d; d++; }
                }
            });

            if (data.continue && data.continue.uccontinue) {
                uccontinue = data.continue.uccontinue;
            } else {
                break;
            }
        }

        editor.scorePT = sPT; editor.scoreGL = sGL;
        editor.score = sPT + sGL; editor.reverts = revCount; editor.isBot = botFound;
        editor.lastItem = lastItem; // 🚨 NEW: Store tracked item
        editor.workBreakdown = `${l}L / ${d}D / ${f}F / ${r}R / ${img}i`;
        editor.earnedBadges = getEarnedBadges(editor.scorePT);
        
        updateMissionStats(); 
        renderTable();
    } catch { editor.workBreakdown = "ERR_API"; }
}

function updateMissionStats() {
    const totalScore = participants.reduce((acc, p) => acc + (p.isVetoed ? 0 : p.score), 0);
    const totalEdits = participants.reduce((acc, p) => {
        const parts = p.workBreakdown.split(' / ').map(v => parseInt(v) || 0);
        return acc + (p.isVetoed ? 0 : parts.reduce((a, b) => a + b, 0));
    }, 0);
    document.getElementById('mission-total-score').innerText = totalScore.toLocaleString();
    document.getElementById('mission-total-edits').innerText = totalEdits.toLocaleString();
}

function updateDates() {
    dateRange.start = document.getElementById('start-date').value;
    dateRange.end = document.getElementById('end-date').value;
    startLiveCycle();
}

function updateWeights() {
    weights.l = parseInt(document.getElementById('w-l').value) || 0;
    weights.d = parseInt(document.getElementById('w-d').value) || 0;
    weights.f = parseInt(document.getElementById('w-f').value) || 0;
    weights.r = parseInt(document.getElementById('w-r').value) || 0;
    weights.i = parseInt(document.getElementById('w-i').value) || 0;
    participants.forEach(p => fetchScore(p));
}

function toggleVeto(name) {
    const user = participants.find(p => p.name === name);
    if (user) { user.isVetoed = !user.isVetoed; updateMissionStats(); renderTable(); }
}

function toggleBotView() {
    showBots = !showBots;
    const btn = document.getElementById('bot-toggle-btn');
    btn.classList.toggle('active', showBots);
    btn.innerText = showBots ? "BOT_VIEW: ON" : "BOT_VIEW: OFF";
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('leaderboard-body');
    let sorted = [...participants];
    if (currentSort === "desc") sorted.sort((a, b) => b.score - a.score);
    else if (currentSort === "asc") sorted.sort((a, b) => a.score - b.score);
    const filter = document.getElementById('search-name').value.toLowerCase();
    
    tbody.innerHTML = sorted.filter(p => p.name.toLowerCase().includes(filter)).map(p => `
        <tr class="border-b border-[#2d2d35] ${p.isVetoed ? 'grayscale' : ''}">
            <td class="pl-3 md:pl-6 pr-2 py-4 text-white font-bold flex items-center gap-1 md:gap-2 w-[130px] md:w-[180px]">
                <span class="truncate cursor-help" onclick="showNameTooltip(event, '${p.name}')">${p.name}</span>
                ${(p.isBot && showBots) ? '<span class="bot-tag px-1 py-0.5 rounded ml-2">BOT</span>' : ''}
                <div class="flex gap-1 md:gap-2 ml-auto">
                    <a href="https://www.wikidata.org/wiki/Special:Contributions/${encodeURIComponent(p.name)}" target="_blank" class="edit-link">🔗</a>
                    <button onclick="toggleVeto('${p.name}')" class="veto-btn ${p.isVetoed ? 'veto-active' : ''}">🚫</button>
                </div>
            </td>
            <td class="px-2 py-4 text-center">
                <div class="flex items-center justify-center -space-x-3 mx-auto w-fit">
                    ${p.earnedBadges.map(b => `
                        <div class="achievement-wrapper">
                            <img src="${b.img}" class="status-badge ${b.pts >= 2000 ? 'legendary-zoom' : ''}">
                            <span class="badge-tooltip">${b.rank}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td class="px-6 py-4 font-mono">
                <div class="text-xl font-bold text-[#ef4444] ${p.isVetoed ? 'line-through' : ''}">${p.score}</div>
                <div class="score-meta text-[#64748b]">
                    PT: <span class="text-[#00ff9d]">${p.scorePT || 0}</span> | 
                    GL: <span class="text-[#38bdf8]">${p.scoreGL || 0}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-[#38bdf8] text-[10px] font-mono">
                ${p.workBreakdown}

                <div class="mt-1 flex items-center gap-1 opacity-80">
                    <span class="text-[8px] text-[#64748b]">LAST_TRACKED:</span>
                    ${p.lastItem !== "---" 
                        ? `<a href="https://www.wikidata.org/wiki/${p.lastItem}" target="_blank" class="text-[#00ff9d] hover:underline underline-offset-2">${p.lastItem}</a>` 
                        : `<span class="text-[#64748b]">NONE</span>`}
                </div>

                ${(showBots && p.reverts > 0) ? `<span class="revert-subtle ml-2">(${p.reverts} reverted)</span>` : ''}
            </td>
        </tr>
    `).join('');
}

function forceSync() {
    localStorage.removeItem('cached_participants');
    harvestData("WMB/Cada_Livro_Seu_Público_2026_-_edite_sobre_livros_e_autores_na_Wikipédia", true);
}

async function harvestData(slug, isForced = false) {
    try {
        const cacheBuster = isForced ? `?t=${Date.now()}` : '';
        const url = `https://outreachdashboard.wmflabs.org/courses/${slug}/users.json${cacheBuster}`;
        const res = await fetch(PROXY + encodeURIComponent(url));
        const data = await res.json();
        const liveUsers = (data.course ? data.course.users : data.users).map(u => ({
            name: u.username.replace(/\s*\(WMB\)\s*/g, "").trim(),
            score: 0, scorePT: 0, scoreGL: 0, reverts: 0, workBreakdown: "QUEUED", lastItem: "---", earnedBadges: [], isBot: false, isVetoed: false
        }));
        localStorage.setItem('cached_participants', JSON.stringify(liveUsers));
        participants = liveUsers;
    } catch (err) {
        const cached = localStorage.getItem('cached_participants');
        if (cached) {
            participants = JSON.parse(cached);
        } else {
            participants = backupList.map(p => ({ ...p, score: 0, scorePT: 0, scoreGL: 0, reverts: 0, workBreakdown: "OFFLINE", lastItem: "---", earnedBadges: [], isBot: false, isVetoed: false }));
        }
    }
    renderTable();
    startLiveCycle();
}

function downloadCSV() {
    let csv = "data:text/csv;charset=utf-8,Rank,Username,Status,Breakdown,LastQID,ScorePT,ScoreGL,TotalScore\n";
    [...participants].sort((a,b) => b.score - a.score).forEach((p, i) => {
        csv += `${i+1},"${p.name}",${p.isVetoed ? 'VETOED' : 'ACTIVE'},"${p.workBreakdown}","${p.lastItem}",${p.scorePT},${p.scoreGL},${p.score}\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv); link.download = `WikiScore_Mission_Report.csv`; link.click();
}

async function startLiveCycle() {
    scannedProgress = 0; const queue = [...participants]; const total = queue.length;
    const workers = Array(Math.min(queue.length, CONCURRENCY_LIMIT)).fill(0).map(async () => {
        while(queue.length > 0) { await fetchScore(queue.shift()); scannedProgress++; document.getElementById('status-text').innerHTML = `SCANNING [${scannedProgress}/${total}]`; }
    });
    await Promise.all(workers); document.getElementById('status-text').innerHTML = `SYSTEM LIVE`;
}

function renderLegend() {
    document.getElementById('badge-legend').innerHTML = badgeRules.map(r => `
        <div class="flex justify-between items-center text-[10px] py-2 border-b border-[#ffffff10] opacity-80">
            <div class="flex items-center gap-3">
                <div class="rounded-full border border-[#ffffff20] w-[45px] h-[45px] flex items-center justify-center overflow-hidden">
                    <img src="${r.img}" class="w-full h-full object-contain">
                </div>
                <span class="text-white">${r.rank}</span>
            </div>
            <span class="text-[#38bdf8]">${r.pts} PTS</span>
        </div>
    `).join('');
}

function setSort(val) { currentSort = val; renderTable(); }
document.getElementById('search-name').addEventListener('input', renderTable);
renderLegend();
harvestData("WMB/Cada_Livro_Seu_Público_2026_-_edite_sobre_livros_e_autores_na_Wikipédia");

function showNameTooltip(event, name) {
    const existing = document.getElementById('temp-tooltip');
    if (existing) existing.remove();
    const tip = document.createElement('div');
    tip.id = 'temp-tooltip';
    tip.innerText = name;
    tip.className = "fixed bg-[#0a0a0c] border border-[#38bdf8] text-[#38bdf8] text-[10px] px-2 py-1 rounded shadow-2xl z-[9999] pointer-events-none font-mono uppercase animate-fade-in";
    tip.style.left = `${event.clientX}px`;
    tip.style.top = `${event.clientY - 30}px`;
    document.body.appendChild(tip);
    setTimeout(() => { tip.classList.add('opacity-0'); setTimeout(() => tip.remove(), 500); }, 2000);
}

function initScrollWatcher() {
    const container = document.getElementById('table-scroll-zone');
    const hint = document.getElementById('swipe-hint');
    if (container && hint) {
        container.onscroll = function() {
            if (container.scrollLeft > 30) { hint.style.opacity = "0"; hint.style.pointerEvents = "none"; }
            else { hint.style.opacity = "1"; hint.style.pointerEvents = "auto"; }
        };
    } else { setTimeout(initScrollWatcher, 300); }
}
initScrollWatcher();
