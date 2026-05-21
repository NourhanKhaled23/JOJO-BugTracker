export interface Attachment {
  id: string;
  bugId: string;
  fileName: string;
  fileSize: number;   // bytes
  fileType: string;   // MIME type
  dataUrl: string;    // base64 data URL for preview/download
  uploadedAt: string;
}
