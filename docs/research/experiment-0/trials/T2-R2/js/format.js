export const fmtMs = (n) => `${n} ms`;
export const fmtPct = (n, digits = 2) => `${Number(n).toFixed(digits)}%`;
export const fmtDuration = (sec) => `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s (${sec}s)`;
export const fmtSigned = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
export const fmtTime = (iso) => iso.slice(0, 16).replace('T', ' ') + 'Z';
export const STATUS_LABEL = {
  degraded: 'Degraded', warning: 'Warning', healthy: 'Healthy',
  failed: 'Failed', rolled_back: 'Rolled back', succeeded: 'Succeeded',
};
