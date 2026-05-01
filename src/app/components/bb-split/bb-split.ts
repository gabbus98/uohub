import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

const WEIGHT_MAP: { match: RegExp; weight: number }[] = [
  { match: /[\n]/, weight: 0 },
  { match: /[\s.,:;]/, weight: 0.5 },
  { match: /[a-z]/, weight: 1 },
  { match: /[A-Z0-9]/, weight: 1.333 },
];

const ROW_MAX_WEIGHT = 32;
const ROW_MAX_NUM = 39;
const MAX_POSTS = 39;
const LS_KEY = 'TMBBSplit';

function charWeight(ch: string): number {
  for (const { match, weight } of WEIGHT_MAP) {
    if (match.test(ch)) return weight;
  }
  return 1;
}

function lineWeight(line: string): number {
  let w = 0;
  for (const ch of line) w += charWeight(ch);
  return w;
}

function splitLine(line: string): string[] {
  const rows: string[] = [];
  const words = line.split(' ');
  let current = '';
  let currentW = 0;

  for (const word of words) {
    const wordW = lineWeight(word);
    const spaceW = current ? 0.5 : 0;

    if (wordW > ROW_MAX_WEIGHT) {
      // Word too long to fit on any row — split character by character
      if (current) { rows.push(current); current = ''; currentW = 0; }
      let partial = '';
      let partialW = 0;
      for (const ch of word) {
        const cw = charWeight(ch);
        if (partialW + cw > ROW_MAX_WEIGHT) {
          rows.push(partial);
          partial = ch;
          partialW = cw;
        } else {
          partial += ch;
          partialW += cw;
        }
      }
      current = partial;
      currentW = partialW;
    } else if (current && currentW + spaceW + wordW > ROW_MAX_WEIGHT) {
      rows.push(current);
      current = word;
      currentW = wordW;
    } else {
      current = current ? current + ' ' + word : word;
      currentW += spaceW + wordW;
    }
  }
  if (current) rows.push(current);
  return rows;
}

function buildPosts(lines: string[]): string[] {
  const rows: string[] = [];

  for (const line of lines) {
    if (line === '---') {
      rows.push('---');
    } else if (line.trim() === '') {
      rows.push('');
    } else {
      rows.push(...splitLine(line));
    }
  }

  const posts: string[] = [];
  let current: string[] = [];

  for (const row of rows) {
    if (row === '---') {
      if (current.length) { posts.push(current.join('\n')); current = []; }
    } else if (current.length >= ROW_MAX_NUM) {
      posts.push(current.join('\n'));
      current = [row];
    } else {
      current.push(row);
    }
    if (posts.length >= MAX_POSTS) break;
  }
  if (current.length && posts.length < MAX_POSTS) posts.push(current.join('\n'));
  return posts;
}

@Component({
  selector: 'app-bb-split',
  imports: [FormsModule],
  templateUrl: './bb-split.html'
})
export class BbSplitComponent implements OnInit {
  inputText = signal('');
  copiedIndex = signal<number | null>(null);

  private copyTimers = new Map<number, ReturnType<typeof setTimeout>>();

  title = computed(() => {
    const lines = this.inputText().split('\n');
    return lines[0]?.trim() || null;
  });

  posts = computed(() => {
    const lines = this.inputText().split('\n');
    const body = lines.slice(1);
    return buildPosts(body);
  });

  ngOnInit() {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) this.inputText.set(saved);
  }

  onInput(value: string) {
    this.inputText.set(value);
    localStorage.setItem(LS_KEY, value);
  }

  copyPost(index: number) {
    const text = index === -1 ? (this.title() ?? '') : this.posts()[index];
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });

    const prev = this.copyTimers.get(index);
    if (prev) clearTimeout(prev);
    this.copiedIndex.set(index);
    const t = setTimeout(() => {
      if (this.copiedIndex() === index) this.copiedIndex.set(null);
      this.copyTimers.delete(index);
    }, 2000);
    this.copyTimers.set(index, t);
  }

  reset() {
    this.inputText.set('');
    localStorage.removeItem(LS_KEY);
  }
}
