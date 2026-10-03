/* Countdown — local store and cloud sync.

   Every piece of data is a small record keyed like:
     t/<subject_paper>                 a target
     p/<subject_paper_year_series_v>   a Paper Library entry
     g/<goal id>                       a goal
     e/<YYYY-MM-DD>/<subject_paper>    one Calendar cell (planned/done)
     e/<YYYY-MM-DD>/__rest             a rest day
   Each record carries a timestamp. Devices exchange only changed records, and
   the newer timestamp wins per record, so edits made on the phone and the iPad
   merge instead of overwriting each other. Deleting stores an empty record so
   the deletion travels too. */

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};

const Store = {
  rec: {},
  dirty: new Set(),
  lastU: 0,

  load() {
    this.rec = LS.get('cd.rec', {}) || {};
    this.dirty = new Set(LS.get('cd.dirty', []) || []);
    this.lastU = 0;
    for (const r of Object.values(this.rec)) if (r && r.u > this.lastU) this.lastU = r.u;
  },

  persist() {
    const ok = LS.set('cd.rec', this.rec) && LS.set('cd.dirty', [...this.dirty]);
    if (!ok && typeof App !== 'undefined') App.toast('This browser is out of storage space. Your latest change may not be saved.');
  },

  stamp() {
    const t = Math.max(Date.now(), this.lastU + 1);
    this.lastU = t;
    return t;
  },

  /* Write a record; v === null deletes. Returns true if anything changed. */
  put(k, v) {
    const val = v === undefined ? null : v;
    const cur = this.rec[k];
    if (!cur && val === null) return false;
    if (cur && JSON.stringify(cur.v) === JSON.stringify(val)) return false;
    this.rec[k] = { v: val, u: this.stamp() };
    this.dirty.add(k);
    return true;
  },

  /* Apply a record that came from the cloud. Returns true if it replaced ours. */
  merge(k, v, u) {
    const cur = this.rec[k];
    if (!cur || cur.u < u) {
      this.rec[k] = { v: v === undefined ? null : v, u };
      this.dirty.delete(k);
      if (u > this.lastU) this.lastU = u;
      return true;
    }
    if (cur.u > u) this.dirty.add(k);
    return false;
  },

  liveCount() {
    let n = 0;
    for (const r of Object.values(this.rec)) if (r && r.v !== null) n++;
    return n;
  },

  wipe() {
    this.rec = {};
    this.dirty = new Set();
    this.lastU = 0;
    LS.del('cd.rec');
    LS.del('cd.dirty');
  },
};

const Sync = {
  key: null,
  cursor: 0,
  status: 'local',      // local | syncing | ok | offline | error
  message: '',
  lastOk: 0,
  busy: false,
  again: false,
  timer: null,
  pollTimer: null,
  listeners: [],

  config() {
    const c = window.COUNTDOWN_CONFIG || {};
    return c.url && c.key ? c : null;
  },

  init() {
    this.key = LS.get('cd.key', null);
    this.cursor = LS.get('cd.cursor', 0) || 0;
    this.lastOk = LS.get('cd.lastOk', 0) || 0;
    this.status = this.enabled() ? (navigator.onLine ? 'syncing' : 'offline') : 'local';
    window.addEventListener('online', () => this.syncNow());
    window.addEventListener('offline', () => this.setStatus('offline'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.syncNow();
      else this.flushOnHide();
    });
    window.addEventListener('pagehide', () => this.flushOnHide());
  },

  enabled() { return !!(this.key && this.config()); },

  onChange(fn) { this.listeners.push(fn); },

  setStatus(s, msg) {
    this.status = s;
    this.message = msg || '';
    this.listeners.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
  },

  headers() {
    const c = this.config();
    const h = { 'Content-Type': 'application/json', apikey: c.key };
    if (!String(c.key).startsWith('sb_')) h.Authorization = 'Bearer ' + c.key;
    return h;
  },

  async rpc(fn, body, opts = {}) {
    const c = this.config();
    const r = await fetch(`${c.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
      keepalive: !!opts.keepalive,
    });
    if (!r.ok) {
      let msg = '';
      try { const j = await r.json(); msg = j.message || j.hint || JSON.stringify(j); } catch (e) { msg = 'HTTP ' + r.status; }
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  },

  schedule(ms = 700) {
    if (!this.enabled()) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.syncNow(), ms);
  },

  startPolling() {
    clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') this.syncNow();
    }, 20000);
  },

  async syncNow(opts = {}) {
    if (!this.enabled()) { this.setStatus('local'); return; }
    if (this.busy) { this.again = true; return; }
    if (!navigator.onLine) { this.setStatus('offline'); return; }
    this.busy = true;
    if (this.status !== 'ok' || opts.full) this.setStatus('syncing');
    try {
      await this.push();
      await this.pull(opts.full ? 0 : this.cursor);
      if (Store.dirty.size) await this.push();
      this.lastOk = Date.now();
      LS.set('cd.lastOk', this.lastOk);
      this.setStatus('ok');
    } catch (e) {
      if (/unknown_vault/.test(e.message)) this.setStatus('error', 'This private link is not recognised.');
      else if (!navigator.onLine) this.setStatus('offline');
      else {
        this.setStatus('error', 'Could not reach the sync server. Changes are kept on this device and will sync later.');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.syncNow(), 8000);
      }
    } finally {
      this.busy = false;
      if (this.again) { this.again = false; this.schedule(300); }
    }
  },

  async push() {
    const keys = [...Store.dirty].filter((k) => Store.rec[k]);
    for (let i = 0; i < keys.length; i += 400) {
      const chunk = keys.slice(i, i + 400);
      const rows = chunk.map((k) => ({ k, v: Store.rec[k].v, u: Store.rec[k].u }));
      await this.rpc('cd_push', { p_secret: this.key, p_rows: rows });
      for (const r of rows) {
        if (Store.rec[r.k] && Store.rec[r.k].u === r.u) Store.dirty.delete(r.k);
      }
      Store.persist();
    }
  },

  async pull(since) {
    const res = await this.rpc('cd_pull', { p_secret: this.key, p_since: since || 0 });
    let changed = false;
    for (const row of (res && res.rows) || []) {
      if (Store.merge(row.k, row.v, Number(row.u))) changed = true;
    }
    if (res && typeof res.max === 'number') {
      this.cursor = res.max;
      LS.set('cd.cursor', this.cursor);
    }
    Store.persist();
    if (changed && typeof App !== 'undefined') App.onRemoteChange();
  },

  flushOnHide() {
    if (!this.enabled() || !Store.dirty.size || !navigator.onLine) return;
    const rows = [...Store.dirty].filter((k) => Store.rec[k]).slice(0, 300)
      .map((k) => ({ k, v: Store.rec[k].v, u: Store.rec[k].u }));
    this.rpc('cd_push', { p_secret: this.key, p_rows: rows }, { keepalive: true })
      .then(() => {
        for (const r of rows) if (Store.rec[r.k] && Store.rec[r.k].u === r.u) Store.dirty.delete(r.k);
        Store.persist();
      })
      .catch(() => { /* stays dirty; next visit retries */ });
  },

  /* Connect this device to a private link. Checks the key before saving it. */
  async connect(secret) {
    const prevKey = this.key;
    this.key = secret;
    // Deletions made while this device was offline-only refer to local data, never the cloud's.
    for (const [k, r] of Object.entries(Store.rec)) {
      if (r && r.v === null) { delete Store.rec[k]; Store.dirty.delete(k); }
    }
    try {
      const res = await this.rpc('cd_pull', { p_secret: secret, p_since: 0 });
      LS.set('cd.key', secret);
      this.cursor = 0;
      for (const row of (res && res.rows) || []) Store.merge(row.k, row.v, Number(row.u));
      if (res && typeof res.max === 'number') { this.cursor = res.max; LS.set('cd.cursor', this.cursor); }
      Store.persist();
      await this.push();
      this.lastOk = Date.now();
      LS.set('cd.lastOk', this.lastOk);
      this.setStatus('ok');
      this.startPolling();
      return true;
    } catch (e) {
      this.key = prevKey;
      throw e;
    }
  },

  disconnect() {
    this.key = null;
    this.cursor = 0;
    LS.del('cd.key');
    LS.del('cd.cursor');
    LS.del('cd.lastOk');
    clearInterval(this.pollTimer);
    this.setStatus('local');
  },

  link() {
    if (!this.key) return '';
    const base = location.href.split('#')[0].split('?')[0];
    return `${base}#k=${this.key}`;
  },
};
