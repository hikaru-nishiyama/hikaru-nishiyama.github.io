
const PROFILE_LINKS = [
  { label: "Google Scholar", icon: "fa-brands fa-google-scholar", url: "https://scholar.google.com/" },
  { label: "IEEE Author Details", icon: "fa-solid fa-microchip", url: "https://ieeexplore.ieee.org/" },
  { label: "Researchmap", icon: "fa-solid fa-id-card", url: "https://researchmap.jp/" },
  { label: "AIST CPSEC", icon: "fa-solid fa-building-shield", url: "https://www.aist.go.jp/" }
];

const LABELS = {
  journal: "Journal",
  international: "International",
  domestic: "Domestic",
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

function venue(p){ return p.journal || p.booktitle || p.howpublished || p.note || ""; }
function authors(a){
  return esc(a)
    .replace(/Hikaru Nishiyama/g, '<span class="me">Hikaru Nishiyama</span>')
    .replace(/西山 輝/g, '<span class="me">西山 輝</span>');
}

function render(){
  const q = document.querySelector("#publication-search").value.toLowerCase();
  const filtered = pubs.filter(p =>
    (active === "all" || p.category === active) &&
    [p.title, p.author, venue(p), p.year].join(" ").toLowerCase().includes(q)
  );

  document.querySelector("#publication-status").textContent = `${filtered.length} entries`;
  const years = [...new Set(filtered.map(p => p.year || "Undated"))].sort((a,b) => String(b).localeCompare(String(a)));

  document.querySelector("#publication-list").innerHTML = years.map(y => `
    <section class="publication-year">
      <h3>${esc(y)}</h3>
      <div class="publication-items">
        ${filtered.filter(p => (p.year || "Undated") === y).map(p => `
          <article class="publication-item">
            <p class="title">${esc(p.title)}</p>
            <p class="authors">${authors(p.author)}</p>
            <p class="venue">${esc(venue(p))}${p.volume ? `, vol. ${esc(p.volume)}` : ""}${p.number ? `, no. ${esc(p.number)}` : ""}${p.pages ? `, pp. ${esc(p.pages)}` : ""}</p>
            <div class="pub-meta">
              <span class="badge">${esc(LABELS[p.category] || p.category || "Other")}</span>
              ${p.url ? `<a class="pub-link" href="${esc(p.url)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link</a>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("") || '<p class="muted">No matching entries.</p>';
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#current-year").textContent = new Date().getFullYear();
  document.querySelector("#profile-links").innerHTML = PROFILE_LINKS.map(x => `<a class="icon-link" href="${x.url}" target="_blank" title="${x.label}" aria-label="${x.label}"><i class="${x.icon}"></i></a>`).join("");

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
