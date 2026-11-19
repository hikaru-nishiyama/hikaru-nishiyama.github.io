
const PROFILE_LINKS = [
  { label: "Researchmap", mark: "rm", markClass: "mark-researchmap", url: "https://researchmap.jp/hikaru.nishiyama" },
  { label: "Google Scholar", icon: "fa-brands fa-google-scholar", url: "https://scholar.google.com/citations?user=NVYVIGoAAAAJ&hl=ja" },
  { label: "KAKEN Researcher Profile", mark: "KAKEN", markClass: "mark-kaken", url: "https://nrid.nii.ac.jp/ja/nrid/1000021003287/" },
  { label: "IEEE Author Detail", mark: "IEEE", markClass: "mark-ieee", url: "https://ieeexplore.ieee.org/author/37087115618" },
];

const LABELS = {
  journal: "Journal",
  international: "International Conference",
  domestic: "Domestic Activity",
  talk: "Talk"
};

let pubs = [], active = "all";

const esc = s => (s || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

function parseBib(src){
  const out = [];
  const re = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\}/g;
  let m;
  while((m = re.exec(src))){
    const fields = { type:m[1].toLowerCase(), key:m[2].trim() };
    const body = m[3];
    const fre = /(\w+)\s*=\s*\{([\s\S]*?)\}\s*,?/g;
    let f;
    while((f = fre.exec(body))) fields[f[1].toLowerCase()] = f[2].replace(/\s+/g, " ").trim();
    out.push(fields);
  }
  return out;
}


function idSlug(s){
  return String(s || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function venue(p){ return p.journal || p.booktitle || p.howpublished || p.note || ""; }
function authors(a){
  return esc(a).replace(/ and /g, ", ")
    .replace(/Hikaru Nishiyama/g, '<span class="me">Hikaru Nishiyama</span>')
    .replace(/西山 輝/g, '<span class="me">西山 輝</span>');
}

function formatVenue(p){
  return esc(venue(p))
    .replace(/Invited Talk/g, '<span class="invited-talk">Invited Talk</span>')
    .replace(/招待講演/g, '<span class="invited-talk">招待講演</span>');
}

function render(){
  const q = document.querySelector("#publication-search").value.toLowerCase();
  const filtered = pubs.filter(p =>
    (active === "all" || p.category === active) &&
    [p.title, p.author, venue(p), p.year].join(" ").toLowerCase().includes(q)
  );

  document.querySelector("#publication-status").textContent = `${filtered.length} ${filtered.length === 1 ? "Item" : "Items"}`;
  const years = [...new Set(filtered.map(p => p.year || "Undated"))].sort((a,b) => String(b).localeCompare(String(a)));

  document.querySelector("#publication-list").innerHTML = years.map(y => `
    <section class="publication-year">
      <h3>${esc(y)}</h3>
      <div class="publication-items">
        ${filtered.filter(p => (p.year || "Undated") === y).map(p => `
          <article class="publication-item" id="pub-${idSlug(p.key)}">
            <p class="title">${esc(p.title)}</p>
            <p class="authors">${authors(p.author)}</p>
            <p class="venue">${formatVenue(p)}${p.volume ? `, vol. ${esc(p.volume)}` : ""}${p.number ? `, no. ${esc(p.number)}` : ""}${p.pages ? `, pp. ${esc(p.pages)}` : ""}</p>
            ${(p.url || p.doi || p.slides || p.status || p.openaccess) ? `<div class="pub-meta">${(p.url || p.doi) ? `<a class="pub-link" href="${esc(p.url || `https://doi.org/${p.doi}`)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link</a>` : ""}${p.slides ? `<a class="pub-link" href="${esc(p.slides)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-powerpoint"></i> Slides</a>` : ""}${p.status ? `<span class="pub-status">${esc(p.status)}</span>` : ""}${p.openaccess === "yes" ? `<span class="oa-label">Open Access</span>` : ""}</div>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `).join("") || '<p class="muted">No matching items.</p>';
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#current-year").textContent = new Date().getFullYear();
  document.querySelector("#profile-links").innerHTML = `<ul class="profile-link-list">${PROFILE_LINKS.map(x => `<li><a class="profile-text-link" href="${x.url}" target="_blank" rel="noopener">${x.label}</a></li>`).join("")}</ul>`;

  try {
    pubs = parseBib(await (await fetch("publications.bib")).text()).sort((a,b) => (+b.year || 0) - (+a.year || 0));
    render();
  } catch (e) {
    document.querySelector("#publication-status").textContent = "Could not load publications.bib. Use a local web server or GitHub Pages.";
  }

  document.querySelectorAll(".filter").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      active = btn.dataset.filter;
      render();
    };
  });

  document.querySelector("#publication-search").oninput = render;
  const nav = document.querySelector("#site-nav");
  const toggle = document.querySelector(".nav-toggle");
  toggle.onclick = () => {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
  };
});
