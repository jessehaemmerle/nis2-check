import type { PolicyDoc } from '../data/policies';

export function policyToMarkdown(doc: PolicyDoc, company: string): string {
  const out = [`# ${doc.title}`, '', `**${company}** · Stand: ${new Date().toLocaleDateString('de-AT')}`, ''];
  for (const s of doc.sections) {
    out.push(`## ${s.heading}`, '');
    for (const p of s.paragraphs ?? []) out.push(p, '');
    if (s.bullets?.length) out.push(...s.bullets.map((b) => `- ${b}`), '');
  }
  return out.join('\n');
}

export async function policyToDocx(doc: PolicyDoc, company: string): Promise<Blob> {
  // docx ist groß und wird erst beim ersten Word-Export geladen.
  const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const children = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(doc.title)] }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: `${company} – Stand: ${new Date().toLocaleDateString('de-AT')}`, italics: true })],
    }),
  ];
  for (const s of doc.sections) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(s.heading)] }));
    for (const p of s.paragraphs ?? []) children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun(p)] }));
    for (const b of s.bullets ?? []) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(b)] }));
  }
  const file = new Document({
    creator: company,
    title: doc.title,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 }, paragraph: { alignment: AlignmentType.LEFT } } } },
    sections: [{ children }],
  });
  return Packer.toBlob(file);
}

export function download(name: string, data: Blob | string, type = 'text/plain') {
  const blob = typeof data === 'string' ? new Blob([data], { type: `${type};charset=utf-8` }) : data;
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'betrieb';
}
