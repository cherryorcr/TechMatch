import { FormEvent } from 'react';
import { paperCountOptions } from '../../mock/home';

interface ChatInputBoxProps {
  disabled?: boolean;
  value: string;
  placeholder: string;
  inputHint: string;
  paperCount: number;
  showReasoning: boolean;
  onChange: (value: string) => void;
  onPaperCountChange: (value: number) => void;
  onShowReasoningChange: (value: boolean) => void;
  onSubmit: () => void | Promise<void>;
}

export function ChatInputBox({
  disabled = false,
  value,
  placeholder,
  inputHint,
  paperCount,
  showReasoning,
  onChange,
  onPaperCountChange,
  onShowReasoningChange,
  onSubmit,
}: ChatInputBoxProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form className="chat-input-box" onSubmit={handleSubmit}>
      <div className="input-frame">
        <textarea
          disabled={disabled}
          placeholder={placeholder}
          rows={7}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <div className="chat-input-footer">
        <span className="chat-input-hint">{inputHint}</span>
        <button className="submit-button" disabled={disabled || !value.trim()} type="submit">
          {disabled ? '提交中...' : '开始对话'}
        </button>
      </div>

      <div className="home-options-row">
        <label className="home-option-field home-option-stepper">
          <span>匹配论文数</span>
          <div className="count-stepper">
            <button
              disabled={disabled}
              type="button"
              onClick={() => onPaperCountChange(Math.max(1, paperCount - 1))}
            >
              -
            </button>
            <input
              disabled={disabled}
              min={1}
              step={1}
              type="number"
              value={paperCount}
              onChange={(event) => onPaperCountChange(Number(event.target.value))}
            />
            <button disabled={disabled} type="button" onClick={() => onPaperCountChange(paperCount + 1)}>
              +
            </button>
          </div>
        </label>

        <label className="home-option-toggle">
          <input
            checked={showReasoning}
            disabled={disabled}
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
              disabled={disabled}
              className={paperCount === option ? 'paper-preset paper-preset-active' : 'paper-preset'}
              onClick={() => onPaperCountChange(option)}
            >
              Top {option}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
