// 儲存偏好失敗時仍可切換；不依賴第三方服務。
export function languageController(render) {
  let language = 'zh';
  try { if (localStorage.getItem('scm-language') === 'en') language = 'en'; } catch {}
  function update(next) {
    language = next;
    document.documentElement.lang = next === 'zh' ? 'zh-Hant' : 'en';
    try { localStorage.setItem('scm-language', next); } catch {}
    render(next);
    document.querySelectorAll('[data-lang]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === next));
    });
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => update(button.dataset.lang)));
  update(language);
  return () => language;
}
