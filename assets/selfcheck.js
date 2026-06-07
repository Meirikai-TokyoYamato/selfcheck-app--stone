/* ===== Self-Check Common JS (result拡張版) ===== */
(function(){
  const $  = (sel, root) => (root||document).querySelector(sel);

  function pickMessage(score, rules){
    if(!Array.isArray(rules)) return null;
    for(const r of rules){
      const hasMin = typeof r.min === 'number';
      const hasMax = typeof r.max === 'number';
      if( (hasMin ? score >= r.min : true) && (hasMax ? score <= r.max : true) ){
        return r.text || null;
      }
    }
    return null;
  }

  function parseJsonParam(value){
    if(!value) return null;
    try { return JSON.parse(value); } catch(e){}
    try { return JSON.parse(decodeURIComponent(value)); } catch(e){}
    return null;
  }

  function isScoreInRange(score, item){
    if(!item) return false;
    if(typeof item.min === 'number' || typeof item.max === 'number'){
      const min = typeof item.min === 'number' ? item.min : -Infinity;
      const max = typeof item.max === 'number' ? item.max : Infinity;
      return score >= min && score <= max;
    }
    const nums = String(item.range || '').match(/\d+/g);
    if(!nums || !nums.length) return false;
    const min = parseInt(nums[0], 10);
    const max = parseInt(nums[1] || nums[0], 10);
    return score >= min && score <= max;
  }

  function initIndex(){
    // 既存の「チェックボックス個数カウント」ページ向け（IBS/膀胱炎/結石/頭痛/CKD）
    const form = $('#selfcheck');
    const judgeBtn = document.querySelector('[data-action="judge"]');
    if(!form || !judgeBtn) return;

    judgeBtn.addEventListener('click', function(){
      const boxes = Array.from(form.querySelectorAll('input[name="q"]')).filter(el => el.checked);
      const count = boxes.length;

      const d = document.body.dataset || {};
      const params = new URLSearchParams({
        score: count,
        threshold: parseInt(d.threshold || '1', 10),
        title: d.title || document.title || 'セルフチェック',
        dept: d.deptName || '',
        deptUrl: d.deptUrl || '',
        deptMin: parseInt(d.deptMin || d.threshold || '1', 10),
      });

      if(d.messages){
        try{ params.set('msgs', encodeURIComponent(d.messages)); }catch(e){}
      }
      // 任意：バッジ表記と単位（未指定なら既定のまま）
      if(d.badge) params.set('badge', d.badge);
      if(d.unit)  params.set('unit', d.unit);

      const resultUrl = d.result || 'result.html';
      location.href = resultUrl + '?' + params.toString();
    });

    const resetBtn = document.querySelector('[data-action="reset"]');
    resetBtn && resetBtn.addEventListener('click', function(){
      form.querySelectorAll('input[name="q"]').forEach(el => el.checked = false);
    });
  }

  function initResult(){
    const resultEl = $('#result');
    if(!resultEl) return;

    const badge = $('#scoreBadge');
    const p = new URLSearchParams(location.search);
    const score     = parseInt(p.get('score') || '0', 10);
    const threshold = parseInt(p.get('threshold') || '1', 10);
    const title     = p.get('title');
    const deptName  = p.get('dept') || '';
    const deptUrl   = p.get('deptUrl') || '';
    const deptMin   = parseInt(p.get('deptMin') || String(threshold), 10);
    const msgsParam = p.get('msgs');
    const scaleParam = p.get('scale');

    // ★NEW：バッジ表記と単位（例：badge=合計点数, unit=点）
    const unit       = p.get('unit')  || '個';
    const badgeLabel = p.get('badge') || '該当項目';

    const h1 = document.querySelector('h1[data-bind="title"]');
    if(title && h1) h1.textContent = `${title}｜結果`;

    if(badge) badge.textContent = `${badgeLabel}：${score}${unit}`;

    let messageText = null;
    if(msgsParam){
      const rules = parseJsonParam(msgsParam);
      if(rules){
        messageText = pickMessage(score, rules);
      }
    }
    if(!messageText){
      messageText = (score >= threshold)
        ? ((threshold === 1)
            ? '1個でも当てはまる方は要注意です。一度病院に受診してみてもいいかもしれません。'
            : `今回のチェックでは ${threshold}個以上で注意が必要です。該当項目がある場合は一度ご受診をご検討ください。`)
        : '今のところ大きな問題はなさそうです。気になる症状があればご相談ください。';
    }
    resultEl.textContent = messageText;

    if(scaleParam){
      const scale = parseJsonParam(scaleParam);
      if(scale){
        const box = $('#scaleBox');
        const list = $('#scaleList');
        if(box && list && Array.isArray(scale) && scale.length){
          list.innerHTML = '';
          scale.forEach(item => {
            if(!item || !item.range || !item.label) return;
            const li = document.createElement('li');
            const range = document.createElement('span');
            const label = document.createElement('strong');
            range.textContent = item.range;
            label.textContent = item.label;
            li.append(range, label);
            if(isScoreInRange(score, item)){
              li.classList.add('is-active');
              li.setAttribute('aria-current', 'true');
            }
            list.appendChild(li);
          });
          if(list.children.length) box.style.display = 'block';
        }
      }
    }

    if(deptName && score >= deptMin){
      const box = $('#deptBox'), link = $('#deptLink'), titleEl = $('#deptTitle');
      if(box) box.style.display = 'block';
      if(titleEl) titleEl.textContent = `当院での該当診療科：${deptName}`;
      if(link){
        try {
          const u = new URL(deptUrl);
          if(!u.searchParams.has('utm_source')) u.searchParams.set('utm_source','selfcheck');
          if(!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium','web');
          if(!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign','selfcheck');
          link.href = u.toString();
        } catch(e){ link.href = deptUrl || '#'; }
        link.textContent = `${deptName}ページへ`;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initIndex();
    initResult();
  });
})();
