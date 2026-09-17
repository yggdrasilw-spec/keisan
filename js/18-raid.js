// Compatible with the existing raid-boss-project rooms/{code} schema.
// SDK loading and authentication happen only when the learner connects.
var NinjaRaid = (function() {
  var room = null, roomData = null, roomListener = null, connectionRef = null;
  var online = false, generation = 0, sdkPromise = null, db = null, streak = 0;
  function status(message) {
    ['raid-status','practice-raid-status'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = message;
    });
  }
  function normalizeCode(value) { return value.normalize('NFKC').trim().toUpperCase(); }
  function loadScript(url) {
    return new Promise(function(resolve,reject) {
      var el = document.createElement('script'); el.src = url;
      var timer = setTimeout(function() { el.remove(); reject(new Error('接続がタイムアウトしました。もう一度お試しください。')); }, 12000);
      el.onload = function() { clearTimeout(timer); resolve(); };
      el.onerror = function() { clearTimeout(timer); el.remove(); reject(new Error('通信できません。接続を確認して再試行してください。')); };
      document.head.appendChild(el);
    });
  }
  async function getDatabase() {
    if (!sdkPromise) sdkPromise = (async function() {
      var base = 'https://www.gstatic.com/firebasejs/10.14.1/';
      if (!window.firebase) await loadScript(base + 'firebase-app-compat.js');
      if (!firebase.auth) await loadScript(base + 'firebase-auth-compat.js');
      if (!firebase.database) await loadScript(base + 'firebase-database-compat.js');
      var app = firebase.apps.find(function(a) { return a.name === 'ninja-raid'; }) || firebase.initializeApp({
        apiKey:'AIzaSyDdqalOwQFkZnNvFCKzXqM4VeP4IBPhzXo',
        authDomain:'raid-boss-project.firebaseapp.com',
        databaseURL:'https://raid-boss-project-default-rtdb.asia-southeast1.firebasedatabase.app',
        projectId:'raid-boss-project', appId:'1:195656323635:web:ca2dd1251af61929080946'
      }, 'ninja-raid');
      await app.auth().signInAnonymously();
      return app.database();
    })().catch(function(error) { sdkPromise = null; throw error; });
    return sdkPromise;
  }
  function validRoom(data) {
    return data && data.boss && Number.isFinite(data.boss.currentHp) && Number.isFinite(data.boss.maxHp) &&
      (!data.expiresAt || data.expiresAt > Date.now());
  }
  function updateBoss() {
    if (!validRoom(roomData)) { status('⚠️ ルームが終了したか、期限切れです'); return; }
    if (!online) { status('🟡 通信待ち（攻撃は送信しません）'); return; }
    var boss = roomData.boss;
    status(boss.currentHp <= 0 ? '🎉 ボスを たおした！' : '👾 ' + (boss.name || 'ボス') + '　HP ' + Math.max(0,boss.currentHp) + ' / ' + boss.maxHp);
  }
  function disconnect(quiet) {
    generation++;
    if (room && roomListener) room.off('value',roomListener);
    if (connectionRef) connectionRef.off();
    room = null; roomData = null; roomListener = null; connectionRef = null; online = false; streak = 0;
    var button = document.getElementById('raid-connect');
    if (button) { button.disabled = false; button.textContent = '接続'; }
    if (!quiet) status('⚪ レイド未接続');
  }
  async function connect() {
    disconnect(true);
    var token = generation;
    var codeInput = document.getElementById('raid-code');
    var code = normalizeCode(codeInput.value); codeInput.value = code;
    if (!/^[A-Z0-9]{4,8}$/.test(code)) { status('⚠️ コードは半角英数字4〜8文字で入力してください'); return; }
    var button = document.getElementById('raid-connect'); button.disabled = true; button.textContent = '確認中…';
    status('🟡 ルーム確認中…');
    try {
      db = await getDatabase();
      if (token !== generation) return;
      var ref = db.ref('rooms/' + code);
      var snapshot = await ref.once('value');
      if (token !== generation) return;
      if (!validRoom(snapshot.val())) throw new Error('ルームが見つからないか、期限切れです。');
      room = ref; roomData = snapshot.val();
      roomListener = function(s) { if (token !== generation) return; roomData = s.val(); updateBoss(); };
      ref.on('value',roomListener,function() { if (token === generation) { disconnect(true); status('⚠️ 接続できません。もう一度接続してください'); } });
      connectionRef = db.ref('.info/connected');
      connectionRef.on('value',function(s) { if (token === generation) { online = s.val() === true; updateBoss(); } });
      storageSaveText('raid_boss_student_name', document.getElementById('raid-name').value.trim());
    } catch(error) {
      if (token === generation) { disconnect(true); status('⚠️ ' + (error.message || '接続に失敗しました')); }
    } finally {
      if (token === generation) { button.disabled = false; button.textContent = '接続'; }
    }
  }
  async function answer(ok) {
    if (!ok) { streak = 0; return; }
    if (!room || !online || !validRoom(roomData) || roomData.boss.currentHp <= 0) return;
    streak++;
    var damage = 10 * (streak >= 5 ? 3 : streak >= 3 ? 2 : 1);
    var target = room, token = generation, expiresAt = roomData.expiresAt;
    var name = document.getElementById('raid-name').value.trim().slice(0,20) || 'ななし';
    var avatar = document.getElementById('raid-avatar').value;
    try {
      var result = await target.child('boss/currentHp').transaction(function(hp) {
        if (token !== generation || !online || (expiresAt && expiresAt <= Date.now()) || !Number.isFinite(hp) || hp <= 0) return;
        return Math.max(0,hp - damage);
      },undefined,false);
      if (!result.committed) return;
      await target.child('logs').push({name:name, avatar:avatar, damage:damage, detail:'たしざん にんじゃ', timestamp:Date.now()});
      if (token === generation) {
        var el = document.getElementById('practice-raid-status');
        if (el) el.textContent = '💥 ボスへ ' + damage + ' ダメージ！';
      }
    } catch(error) {
      if (token === generation) status('⚠️ 攻撃の通信でエラーが発生しました。計算は続けられます');
    }
  }
  document.addEventListener('DOMContentLoaded',function() {
    var section = document.createElement('section'); section.className = 'learning-settings';
    section.innerHTML = '<h2>👾 レイドボスチャレンジ</h2><p>先生のレイドコードで参加しよう。正解するとボスを攻撃！</p><div class="raid-row"><label>なまえ <input id="raid-name" maxlength="20" placeholder="ななし"></label><label>すがた <select id="raid-avatar"><option>🥷</option><option>⚔️</option><option>🧙‍♂️</option><option>🏹</option><option>🐱</option><option>🐶</option><option>🤖</option></select></label></div><div class="raid-row"><label>コード <input id="raid-code" maxlength="8" autocomplete="off" placeholder="ABCD"></label><button id="raid-connect">接続</button><button id="raid-disconnect">切断</button></div><p id="raid-status" role="status">⚪ レイド未接続</p>';
    document.getElementById('home').appendChild(section);
    document.getElementById('raid-name').value = storageLoadText('raid_boss_student_name','');
    document.getElementById('raid-connect').onclick = connect;
    document.getElementById('raid-disconnect').onclick = function() { disconnect(); };
    var label = document.createElement('div'); label.id = 'practice-raid-status'; label.setAttribute('role','status');
    document.getElementById('practice').appendChild(label);
    var code = new URLSearchParams(location.search).get('code');
    if (code) { document.getElementById('raid-code').value = code; connect(); }
  });
  return { answer:answer, disconnect:disconnect, normalizeCode:normalizeCode };
})();
