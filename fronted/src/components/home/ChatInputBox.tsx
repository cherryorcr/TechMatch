import { FormEvent } from 'react';
import { matchContentOptions, paperCountOptions } from '../../mock/home';
import type { MatchContent } from '../../types/chat';
import { AttachmentPicker } from '../files/AttachmentPicker';

interface ChatInputBoxProps {
  disabled?: boolean;
  files: File[];
  value: string;
  placeholder: string;
  inputHint: string;
  isUploadingFiles?: boolean;
  matchContent: MatchContent;
  paperCount: number;
  showReasoning: boolean;
  onChange: (value: string) => void;
  onAddFiles: (files: File[]) => void;
  onMatchContentChange: (value: MatchContent) => void;
  onRemoveFile: (index: number) => void;
  onPaperCountChange: (value: number) => void;
  onShowReasoningChange: (value: boolean) => void;
  onSubmit: () => void | Promise<void>;
}

export function ChatInputBox({
  disabled = false,
  files,
  value,
  placeholder,
  inputHint,
  isUploadingFiles = false,
  matchContent,
  paperCount,
  showReasoning,
  onChange,
  onAddFiles,
  onMatchContentChange,
  onRemoveFile,
  onPaperCountChange,
  onShowReasoningChange,
  onSubmit,
}: ChatInputBoxProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  const trimmedValue = value.trim();
  const characterCount = trimmedValue.length;

  return (
    <form className="chat-input-box" onSubmit={handleSubmit}>
      <div className="input-frame">
        <div className="input-frame-head">
          <div className="input-frame-copy">
            <span className="eyebrow">New Chat</span>
            <strong>输入需求，开始匹配</strong>
          </div>

          <span className="input-frame-status">
            {characterCount > 0 ? `已输入 ${characterCount} 字` : '等待输入'}
          </span>
        </div>

        <textarea
          disabled={disabled || isUploadingFiles}
          placeholder={placeholder}
          rows={7}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />

        <AttachmentPicker
          disabled={disabled || isUploadingFiles}
          files={files}
          isUploading={isUploadingFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
        />

        <div className="chat-input-footer">
          <span className="chat-input-hint">{inputHint}</span>
          <button
            className="submit-button"
            disabled={disabled || isUploadingFiles || !trimmedValue}
            type="submit"
          >
            {disabled || isUploadingFiles ? '正在创建...' : '开始对话'}
          </button>
        </div>

        <div className="home-options-row">
          <label className="home-option-field home-option-stepper">
            <span>匹配论文数</span>
            <div className="count-stepper">
              <button
                disabled={disabled || isUploadingFiles}
                type="button"
                onClick={() => onPaperCountChange(Math.max(1, paperCount - 1))}
              >
                -
              </button>
              <input
                disabled={disabled || isUploadingFiles}
                min={1}
                step={1}
                type="number"
                value={paperCount}
                onChange={(event) => onPaperCountChange(Number(event.target.value))}
              />
              <button
                disabled={disabled || isUploadingFiles}
                type="button"
                onClick={() => onPaperCountChange(paperCount + 1)}
              >
                +
              </button>
            </div>
          </label>

          <label className="home-option-field home-option-content">
            <span>匹配内容</span>
            <select
              className="match-content-select"
              disabled={disabled || isUploadingFiles}
              value={matchContent}
              onChange={(event) => onMatchContentChange(event.target.value as MatchContent)}
            >
              {matchContentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="home-option-toggle">
            <input
              checked={showReasoning}
              disabled={disabled || isUploadingFiles}
              type="checkbox"
              onChange={(event) => onShowReasoningChange(event.target.checked)}
            />
            <span>展示思考过程</span>
          </label>

          <div className="home-option-presets">
            {paperCountOptions.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled || isUploadingFiles}
                className={paperCount === option ? 'paper-preset paper-preset-active' : 'paper-preset'}
                onClick={() => onPaperCountChange(option)}
              >
                Top {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
