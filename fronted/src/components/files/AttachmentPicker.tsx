import { useId } from 'react';
import { formatFileSize } from '../../utils/files';

interface AttachmentPickerProps {
  disabled?: boolean;
  files: File[];
  hint?: string;
  isUploading?: boolean;
  label?: string;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function AttachmentPicker({
  disabled = false,
  files,
  hint = '支持多文件上传，文件会先提交到后端再进入当前流程。',
  isUploading = false,
  label = '添加文件',
  onAddFiles,
  onRemoveFile,
}: AttachmentPickerProps) {
  const inputId = useId();
  const isDisabled = disabled || isUploading;

  return (
    <div className="attachment-picker">
      <div className="attachment-picker-head">
        <label className={isDisabled ? 'attachment-trigger attachment-trigger-disabled' : 'attachment-trigger'} htmlFor={inputId}>
          <span className="attachment-trigger-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          <span>{isUploading ? '上传中...' : label}</span>
        </label>
        <input
          id={inputId}
          multiple
          disabled={isDisabled}
          type="file"
          onChange={(event) => {
            const nextFiles = Array.from(event.target.files ?? []);

            if (nextFiles.length > 0) {
              onAddFiles(nextFiles);
            }

            event.target.value = '';
          }}
        />
        <span className="attachment-picker-hint">{hint}</span>
      </div>

      {files.length > 0 ? (
        <div className="attachment-draft-list">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="attachment-draft-item">
              <div>
                <strong>{file.name}</strong>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <button
                aria-label={`移除 ${file.name}`}
                disabled={isDisabled}
                type="button"
                onClick={() => onRemoveFile(index)}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
