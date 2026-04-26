import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Root, Table, TableCell, TableRow } from 'mdast';
import ReactMarkdown from 'react-markdown';
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

export function ChatMarkdown({ className, content }: ChatMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
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
    </div>
  );
}
