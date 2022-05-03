import * as fs from 'fs';

// @ts-ignore
export type Formats = 'json' | 'string';
export function readFile(path: string, format: Formats = 'json') {
  if (!fs.existsSync(path)) {
    throw new Error(`The path ${path} does not point to a file`);
  }
  const raw = fs.readFileSync(path) as any as string;
  if (format === 'string') {
    return raw.toString();
  }
  return JSON.parse(raw);
}

export function readFolder(path: string, format: Formats = 'json') {
  if (!fs.existsSync(path)) {
    throw new Error(`The path ${path} does not point to a folder`);
  }
  const raw = fs.readFileSync(path) as any as string;
  if (format === 'string') {
    return raw.toString();
  }
  return JSON.parse(raw);
}

export function formatBytes(a: number, b = 2, k = 1024) {
  // @ts-ignore
  let d = Math.floor(Math.log(a) / Math.log(k));
  return 0 == a
    ? '0 Bytes'
    : parseFloat((a / Math.pow(k, d)).toFixed(Math.max(0, b))) +
        ' ' +
        ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d];
}

export function toLink(name, path): string {
  return `[${name}](${path})`;
}

const _timelineViewUrl = "https://chromedevtools.github.io/timeline-viewer/";
export function toTimelineViewSingleUrl(path: string, repo: string): string {
  return `${_timelineViewUrl}?${repo}?loadTimelineFromURL=${path}`;
}
export function toImg(path: string, name: string): string {
  return `![${name}](${path})`;
}
