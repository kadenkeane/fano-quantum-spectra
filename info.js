/* ================================================================
   info.js — shared JS for information pages
   ================================================================ */

document.querySelectorAll('.info-body p, .info-body li, .info-body td, .info-body .param-desc, .info-body h2').forEach(el => {
  if (el.innerHTML.includes('$')) {
    el.innerHTML = el.innerHTML.replace(/\$([^$]+)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex, { throwOnError: false, displayMode: false });
      } catch (e) {
        return `$${tex}$`;
      }
    });
  }
});