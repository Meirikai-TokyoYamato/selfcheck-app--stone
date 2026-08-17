(function () {
  'use strict';

  const CONFIG_URL = 'assets/data/selfchecks.json';

  function openResult(config, score) {
    const params = new URLSearchParams({
      score: String(score),
      threshold: String(config.threshold),
      title: config.resultTitle || config.pageTitle,
      dept: config.department,
      deptUrl: config.departmentUrl,
      deptMin: String(config.departmentMin),
      msgs: encodeURIComponent(JSON.stringify(config.messages))
    });

    if (config.badge) params.set('badge', config.badge);
    if (config.unit) params.set('unit', config.unit);
    if (config.scale) params.set('scale', encodeURIComponent(JSON.stringify(config.scale)));

    window.location.href = 'result.html?' + params.toString();
  }

  function renderLayout(config, content) {
    document.title = config.pageTitle;
    document.body.style.setProperty('--chk-top', config.checkboxTop || '.46em');
    document.body.innerHTML =
      '<main class="container' + (config.type === 'score' ? ' container--wide' : '') + '">' +
        '<h1>' + config.heading + '</h1>' +
        '<div class="intro">' + config.intro + '</div>' +
        content +
        '<div class="note">※該当するものがあればチェックを入れてください。<br>判定ボタンを押すと、結果ページに移動します。</div>' +
        '<div class="back-home-wrap"><a class="back-home" href="index.html">健康セルフチェック一覧に戻る</a></div>' +
        '<footer class="hospital-name">明理会東京大和病院</footer>' +
      '</main>';
  }

  function renderCheckboxCheck(config) {
    const questions = config.questions.map(function (text) {
      return '<div class="question"><label><input type="checkbox" name="q" value="1"><span>' + text + '</span></label></div>';
    }).join('');

    renderLayout(config,
      '<form id="selfcheck"><div class="questions">' + questions + '</div>' +
      '<div class="btns"><button type="button" data-action="judge">判定する</button>' +
      '<button type="button" class="reset-btn" data-action="reset">やり直し</button></div></form>');

    const form = document.getElementById('selfcheck');
    document.querySelector('[data-action="judge"]').addEventListener('click', function () {
      openResult(config, form.querySelectorAll('input[name="q"]:checked').length);
    });
    document.querySelector('[data-action="reset"]').addEventListener('click', function () {
      form.reset();
    });
  }

  function renderScoreCheck(config) {
    let rows = '';

    config.questions.forEach(function (question, questionIndex) {
      question.options.forEach(function (option, optionIndex) {
        rows += '<tr>';
        if (optionIndex === 0) {
          rows += '<td class="numcell" rowspan="' + question.options.length + '">' + (questionIndex + 1) + '</td>' +
            '<td class="qtext" rowspan="' + question.options.length + '">' + question.text + '</td>';
        }
        rows += '<td class="scorecell"><label><input type="radio" name="q' + (questionIndex + 1) + '" value="' + option[0] + '">' +
          '<span class="scorebadge">' + option[0] + '</span></label></td><td class="freq">' + option[1] + '</td></tr>';
      });
    });

    renderLayout(config,
      '<form id="selfcheck"><div class="table-wrap"><table><thead><tr>' +
      '<th class="col-num">No.</th><th class="col-state">状　態</th><th class="col-score">点　数</th><th class="col-freq">頻　度</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="btns"><button type="button" data-action="judge">判定する</button>' +
      '<button type="button" class="reset-btn" data-action="reset">やり直し</button></div></form>');

    const form = document.getElementById('selfcheck');
    document.querySelector('[data-action="judge"]').addEventListener('click', function () {
      let score = 0;
      form.querySelectorAll('input[type="radio"]:checked').forEach(function (input) {
        score += Number(input.value);
      });
      openResult(config, score);
    });
    document.querySelector('[data-action="reset"]').addEventListener('click', function () {
      form.reset();
    });
  }

  async function initialize() {
    const checkId = document.body.dataset.check;
    const response = await fetch(CONFIG_URL);
    if (!response.ok) throw new Error('設定ファイルを読み込めませんでした。');
    const checks = await response.json();
    const config = checks[checkId];
    if (!config) throw new Error('セルフチェックの設定が見つかりません。');

    if (config.type === 'score') renderScoreCheck(config);
    else renderCheckboxCheck(config);
  }

  initialize().catch(function (error) {
    console.error(error);
    document.body.innerHTML = '<main class="container"><p class="load-error">セルフチェックを読み込めませんでした。時間をおいて再度お試しください。</p></main>';
  });
}());
