import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Root, Table, TableCell, TableRow } from 'mdast';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Options as RehypeSanitizeOptions } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
  className?: string;
  content: string;
}

const MAX_MATCH_STARS = 5;
const MAX_MATCH_SCORE = 10;
const FILLED_STAR = '\u2b50';
const EMPTY_STAR = '\u2606';
const MATCH_STARS_TEXT_PATTERN = /^[\u2b50\u2606]{5}$/;
const MATCH_SCORE_HEADERS = new Set([
  '\u5339\u914d\u5ea6',
  '\u5339\u914d\u5206',
  '\u5339\u914d\u5206\u6570',
  '\u5339\u914d\u7387',
  '\u5339\u914d\u5ea6\u5f97\u5206',
  'matchscore',
  'matchingscore',
  'compatibility',
  'compatibilityscore',
]);
const EXTRA_SAFE_HTML_TAGS = ['caption', 'col', 'colgroup', 'mark', 'small', 'u'];
const ESCAPED_HTML_PATTERN =
  /&lt;\/?(?:a|blockquote|br|caption|code|col|colgroup|details|div|em|h[1-6]|img|li|mark|ol|p|pre|section|small|span|strong|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b/i;
const HTML_TABLE_PATTERN = /<table\b[\s\S]*?<\/table>/gi;

const chatHtmlSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'title'],
    img: [...(defaultSchema.attributes?.img ?? []), 'alt', 'title', 'width', 'height'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), ...EXTRA_SAFE_HTML_TAGS],
};

function decodeEscapedHtml(value: string) {
  return value
    .replace(/&amp;(lt|gt|quot|apos|#39|#x27|nbsp);/gi, '&$1;')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&');
}

function normalizeRenderableContent(value: string) {
  return ESCAPED_HTML_PATTERN.test(value) ? decodeEscapedHtml(value) : value;
}

function splitRenderableContent(value: string) {
  const segments: Array<{ content: string; type: 'markdown' | 'table' }> = [];
  let lastIndex = 0;

  for (const match of value.matchAll(HTML_TABLE_PATTERN)) {
    const tableHtml = match[0];
    const matchIndex = match.index ?? 0;
    const markdownContent = value.slice(lastIndex, matchIndex);

    if (markdownContent) {
      segments.push({ content: markdownContent, type: 'markdown' });
    }

    segments.push({ content: tableHtml, type: 'table' });
    lastIndex = matchIndex + tableHtml.length;
  }

  const trailingContent = value.slice(lastIndex);

  if (trailingContent) {
    segments.push({ content: trailingContent, type: 'markdown' });
  }

  return segments.length > 0 ? segments : [{ content: value, type: 'markdown' as const }];
}

function getCellLines(cell: Element) {
  return cell.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function renderCellContent(lines: string[]) {
  if (lines.length <= 1) {
    return lines[0] ?? '';
  }

  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function getCellText(cell: TableCell) {
  return cell.children
    .map((child) => ('value' in child && typeof child.value === 'string' ? child.value : ''))
    .join('')
    .trim();
}

function getReactText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getReactText).join('');
  }

  return '';
}

function isMatchScoreHeader(header: string) {
  const normalizedHeader = header
    .replace(/[\s_*`|:：()（）%％-]/g, '')
    .toLowerCase();

  return MATCH_SCORE_HEADERS.has(normalizedHeader);
}

function getMatchStarCount(rawValue: string) {
  const value = rawValue.trim();
  const fractionMatch = value.match(/^(\d+(?:\.\d+)?)\s*\/\s*(5|10)\s*(?:\u661f|\u5206|stars?)?$/i);

  if (fractionMatch) {
    const score = Number(fractionMatch[1]);
    const maxScore = Number(fractionMatch[2]);

    return Math.round((score / maxScore) * MAX_MATCH_STARS);
  }

  const numberMatch = value.match(/^(\d+(?:\.\d+)?)\s*(%|％|\u5206)?$/);

  if (!numberMatch) {
    return null;
  }

  const score = Number(numberMatch[1]);

  if (!Number.isFinite(score)) {
    return null;
  }

  if (numberMatch[2] === '%' || numberMatch[2] === '\uff05') {
    return Math.round(score / 100 * MAX_MATCH_STARS);
  }

  if (score > 0 && score <= 1 && value.includes('.')) {
    return Math.round(score * MAX_MATCH_STARS);
  }

  return Math.round((score / MAX_MATCH_SCORE) * MAX_MATCH_STARS);
}

function renderStars(rawValue: string) {
  const starCount = getMatchStarCount(rawValue);

  if (starCount === null) {
    return null;
  }

  const filledStars = Math.max(0, Math.min(MAX_MATCH_STARS, starCount));

  return FILLED_STAR.repeat(filledStars) + EMPTY_STAR.repeat(MAX_MATCH_STARS - filledStars);
}

function replaceMatchScoreCells(table: Table) {
  const [headerRow, ...bodyRows] = table.children as TableRow[];
  const matchScoreColumnIndexes = headerRow.children
    .map((cell, index) => (isMatchScoreHeader(getCellText(cell as TableCell)) ? index : -1))
    .filter((index) => index >= 0);

  if (matchScoreColumnIndexes.length === 0) {
    return;
  }

  bodyRows.forEach((row) => {
    matchScoreColumnIndexes.forEach((columnIndex) => {
      const cell = row.children[columnIndex] as TableCell | undefined;

      if (!cell) {
        return;
      }

      const stars = renderStars(getCellText(cell));

      if (!stars) {
        return;
      }

      cell.children = [
        {
          type: 'text',
          value: stars,
        },
      ];
    });
  });
}

function remarkMatchScoreStars() {
  return (tree: Root) => {
    tree.children.forEach((node) => {
      if (node.type === 'table' && node.children.length > 1) {
        replaceMatchScoreCells(node);
      }
    });
  };
}

function MarkdownSegment({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, [rehypeSanitize, chatHtmlSchema]]}
      remarkPlugins={[remarkGfm, remarkMatchScoreStars]}
      components={{
        a: ({ ...props }: ComponentPropsWithoutRef<'a'>) => (
          <a
            {...props}
            rel="noreferrer noopener"
            target="_blank"
          />
        ),
        table: ({ ...props }: ComponentPropsWithoutRef<'table'>) => (
          <div className="chat-markdown-table-wrap">
            <table {...props} />
          </div>
        ),
        td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => {
          const text = getReactText(children);

          return (
            <td {...props}>
              {MATCH_STARS_TEXT_PATTERN.test(text) ? (
                <span className="match-stars" aria-label={`${text.split(FILLED_STAR).length - 1} / ${MAX_MATCH_STARS}`}>
                  {text.split('').map((star, index) => (
                    <span
                      key={`${star}-${index}`}
                      className={star === FILLED_STAR ? 'match-star-filled' : 'match-star-empty'}
                    >
                      {star}
                    </span>
                  ))}
                </span>
              ) : (
                children
              )}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function HtmlTableSegment({ content }: { content: string }) {
  if (typeof DOMParser === 'undefined') {
    return <MarkdownSegment content={content} />;
  }

  const document = new DOMParser().parseFromString(content, 'text/html');
  const table = document.querySelector('table');

  if (!table) {
    return <MarkdownSegment content={content} />;
  }

  const rows = Array.from(table.querySelectorAll('tr')).map((row) =>
    Array.from(row.children)
      .filter((cell) => cell.tagName === 'TD' || cell.tagName === 'TH')
      .map((cell) => ({
        isHeader: cell.tagName === 'TH',
        lines: getCellLines(cell),
      })),
  );

  if (rows.length === 0) {
    return <MarkdownSegment content={content} />;
  }

  return (
    <div className="chat-markdown-table-wrap">
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                const CellTag = cell.isHeader ? 'th' : 'td';

                return (
                  <CellTag key={`cell-${rowIndex}-${cellIndex}`}>
                    {renderCellContent(cell.lines)}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChatMarkdown({ className, content }: ChatMarkdownProps) {
  const segments = splitRenderableContent(normalizeRenderableContent(content));

  return (
    <div className={className}>
      {segments.map((segment, index) =>
        segment.type === 'table' ? (
          <HtmlTableSegment key={`table-${index}`} content={segment.content} />
        ) : (
          <MarkdownSegment key={`markdown-${index}`} content={segment.content} />
        ),
      )}
    </div>
  );
}
