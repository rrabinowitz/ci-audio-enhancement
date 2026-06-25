/**
 * In-memory undo/redo for enhancement slider snapshots.
 */

const MAX_DEPTH = 32;

export class ParamHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  push(state) {
    const snapshot = { ...state };
    const prev = this.undoStack[this.undoStack.length - 1];
    if (prev && JSON.stringify(prev) === JSON.stringify(snapshot)) {
      return;
    }
    this.undoStack.push(snapshot);
    if (this.undoStack.length > MAX_DEPTH) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo(current) {
    if (!this.canUndo()) {
      return null;
    }
    this.redoStack.push({ ...current });
    return this.undoStack.pop();
  }

  redo(current) {
    if (!this.canRedo()) {
      return null;
    }
    this.undoStack.push({ ...current });
    return this.redoStack.pop();
  }
}
