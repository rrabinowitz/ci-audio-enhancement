/**
 * In-session playlist queue with sessionStorage metadata persistence.
 * Audio buffers stay in memory; file items keep ArrayBuffers for re-decode.
 */

const STORAGE_KEY = 'ci-enhancement-playlist-v1';

function makeId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class Playlist {
  constructor() {
    this.items = [];
    this.currentIndex = -1;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  getState() {
    return {
      items: this.items.map((item) => ({
        id: item.id,
        name: item.name,
        source: item.source,
        demoId: item.demoId || null,
        ready: Boolean(item.audioBuffer),
        presetId: item.presetId || null
      })),
      currentIndex: this.currentIndex,
      currentId: this.currentIndex >= 0 ? this.items[this.currentIndex]?.id : null
    };
  }

  getCurrentItem() {
    if (this.currentIndex < 0 || this.currentIndex >= this.items.length) {
      return null;
    }
    return this.items[this.currentIndex];
  }

  get length() {
    return this.items.length;
  }

  async addFromFile(file, audioContext) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const item = {
      id: makeId(),
      name: file.name,
      source: 'file',
      arrayBuffer,
      audioBuffer,
      presetId: null
    };
    this.items.push(item);
    if (this.currentIndex < 0) {
      this.currentIndex = this.items.length - 1;
    }
    this._persist();
    this._notify();
    return item;
  }

  async setCurrentFromFile(file, audioContext) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const item = {
      id: makeId(),
      name: file.name,
      source: 'file',
      arrayBuffer,
      audioBuffer,
      presetId: this.getCurrentItem()?.presetId || null
    };

    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      this.items[this.currentIndex] = item;
    } else {
      this.items.push(item);
      this.currentIndex = this.items.length - 1;
    }

    this._persist();
    this._notify();
    return item;
  }

  setCurrentDemo(demoBuffer, name = 'Demo Track (synthetic)', demoId = 'dsp-check') {
    const item = {
      id: makeId(),
      name,
      source: 'demo',
      demoId,
      audioBuffer: demoBuffer,
      presetId: this.getCurrentItem()?.presetId || null
    };

    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      this.items[this.currentIndex] = item;
    } else {
      this.items.push(item);
      this.currentIndex = this.items.length - 1;
    }

    this._persist();
    this._notify();
    return item;
  }

  remove(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }
    const [removed] = this.items.splice(index, 1);
    if (this.currentIndex > index) {
      this.currentIndex -= 1;
    } else if (this.currentIndex === index) {
      this.currentIndex = Math.min(index, this.items.length - 1);
      if (this.items.length === 0) {
        this.currentIndex = -1;
      }
    }
    this._persist();
    this._notify();
    return removed;
  }

  clear() {
    this.items = [];
    this.currentIndex = -1;
    this._persist();
    this._notify();
  }

  select(index) {
    if (index < 0 || index >= this.items.length) {
      return null;
    }
    this.currentIndex = index;
    this._persist();
    this._notify();
    return this.items[index];
  }

  selectById(id) {
    const index = this.items.findIndex((item) => item.id === id);
    return index >= 0 ? this.select(index) : null;
  }

  setPresetForCurrent(presetId) {
    const item = this.getCurrentItem();
    if (item) {
      item.presetId = presetId;
      this._persist();
      this._notify();
    }
  }

  next() {
    if (this.items.length === 0) {
      return null;
    }
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.items.length) {
      return null;
    }
    return this.select(nextIndex);
  }

  previous() {
    if (this.items.length === 0) {
      return null;
    }
    const prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      return null;
    }
    return this.select(prevIndex);
  }

  _persist() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: this.items.map((item) => ({
            id: item.id,
            name: item.name,
            source: item.source,
            demoId: item.demoId || null,
            presetId: item.presetId || null
          })),
          currentIndex: this.currentIndex
        })
      );
    } catch (error) {
      // sessionStorage may be unavailable.
    }
  }

  restoreFromSession(demoBufferFactory) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved.items)) {
        return;
      }

      this.items = saved.items.map((meta) => {
        if (meta.source === 'demo' && typeof demoBufferFactory === 'function') {
          const demoId = meta.demoId || 'dsp-check';
          return {
            ...meta,
            demoId,
            audioBuffer: demoBufferFactory(demoId),
            presetId: meta.presetId || null
          };
        }
        return {
          ...meta,
          audioBuffer: null,
          arrayBuffer: null,
          presetId: meta.presetId || null
        };
      });
      this.currentIndex =
        typeof saved.currentIndex === 'number' ? saved.currentIndex : -1;
      if (this.currentIndex >= this.items.length) {
        this.currentIndex = this.items.length - 1;
      }
      this._notify();
    } catch (error) {
      // Ignore corrupt session data.
    }
  }
}
