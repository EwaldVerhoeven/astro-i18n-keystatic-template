// Types + helpers for the Keystatic document AST (a Slate-like tree).
// The RichText section renders this with a dependency-free Astro renderer
// (RichTextNode.astro), so the section works whether or not Keystatic is
// installed — the JSON shape is the only contract.

export interface RichTextLeaf {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  keyboard?: boolean;
}

export interface RichTextElement {
  type: string;
  children: RichTextNode[];
  level?: number;
  href?: string;
  textAlign?: 'center' | 'end';
  language?: string;
}

export type RichTextNode = RichTextLeaf | RichTextElement;
export type DocumentAst = RichTextNode[];

export function isLeaf(node: RichTextNode): node is RichTextLeaf {
  return typeof (node as RichTextLeaf).text === 'string';
}

// Maps a leaf's active marks to HTML tags, outermost first.
const MARK_TAGS: { key: keyof RichTextLeaf; tag: string }[] = [
  { key: 'code', tag: 'code' },
  { key: 'keyboard', tag: 'kbd' },
  { key: 'strikethrough', tag: 's' },
  { key: 'underline', tag: 'u' },
  { key: 'italic', tag: 'em' },
  { key: 'bold', tag: 'strong' },
  { key: 'superscript', tag: 'sup' },
  { key: 'subscript', tag: 'sub' },
];

export function markTagsFor(leaf: RichTextLeaf): string[] {
  return MARK_TAGS.filter((m) => leaf[m.key]).map((m) => m.tag);
}
