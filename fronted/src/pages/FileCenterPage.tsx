import { useMemo, useState } from 'react';
import { chatApi } from '../api/chatApi';
import { AttachmentPicker } from '../components/files/AttachmentPicker';
import type { UploadedFile } from '../types/chat';
import { formatFileSize } from '../utils/files';

function formatUploadedAt(timestamp: number) {
  if (!Number.isFinite(timestamp)) {
    return '刚刚上传';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}

export function FileCenterPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSize = useMemo(
    () => uploadedFiles.reduce((sum, file) => sum + file.size, 0),
    [uploadedFiles],
  );

  function handleAddFiles(files: File[]) {
    setError(null);
    setSelectedFiles((current) => [...current, ...files]);
  }

  function handleRemoveFile(index: number) {
    setError(null);
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await chatApi.uploadFiles(selectedFiles);
      setUploadedFiles((current) => [...response.files, ...current]);
      setSelectedFiles([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '文件上传失败');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="page-grid file-center-page">
      <section className="panel file-center-header">
        <div>
          <span className="eyebrow">File Workspace</span>
          <h2>文件上传与下载</h2>
          <p>独立验证文件接口，也可以把论文、报告和需求资料先上传到后端文件库。</p>
        </div>
        <div className="file-center-metrics">
          <span>{uploadedFiles.length} 个文件</span>
          <span>{formatFileSize(totalSize)}</span>
        </div>
      </section>

      {error ? <div className="status-banner status-banner-error">{error}</div> : null}

      <section className="panel file-upload-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Upload</span>
            <h3>上传文件</h3>
          </div>
          <button
            className="submit-button"
            disabled={isUploading || selectedFiles.length === 0}
            type="button"
            onClick={() => void handleUpload()}
          >
            {isUploading ? '上传中...' : '上传到文件库'}
          </button>
        </div>

        <AttachmentPicker
          disabled={isUploading}
          files={selectedFiles}
          hint="上传成功后会出现在下方列表，下载按钮会直接请求后端文件流。"
          isUploading={isUploading}
          label="选择文件"
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
        />
      </section>

      <section className="panel file-library-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Downloads</span>
            <h3>已上传文件</h3>
          </div>
        </div>

        {uploadedFiles.length > 0 ? (
          <div className="file-library-list">
            {uploadedFiles.map((file) => (
              <article key={file.id} className="file-library-item">
                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {formatFileSize(file.size)} · {file.mimeType || '未知类型'} ·{' '}
                    {formatUploadedAt(file.uploadedAt)}
                  </span>
                </div>
                <a
                  className="download-button"
                  download={file.name}
                  href={chatApi.getFileDownloadUrl(file.id)}
                >
                  下载
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="recommendation-empty">
            还没有上传成功的文件。选择文件并上传后，这里会显示可下载的文件记录。
          </div>
        )}
      </section>
    </div>
  );
}
