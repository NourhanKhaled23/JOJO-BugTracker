import { Injectable, signal } from '@angular/core';

export interface Attachment {
  id: string;
  bugId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;       // base64 data URL for preview/download
  uploadedAt: string;
  uploadedBy: string;
}

const STORAGE_KEY = 'bugtrackr_attachments';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'text/plain'];

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private _attachments = signal<Attachment[]>(this.load());

  readonly attachments = this._attachments.asReadonly();

  getForBug(bugId: string): Attachment[] {
    return this._attachments().filter(a => a.bugId === bugId);
  }

  getById(id: string): Attachment | undefined {
    return this._attachments().find(a => a.id === id);
  }

  async addFile(bugId: string, file: File, uploadedBy: string): Promise<{ attachment: Attachment | null; error: string | null }> {
    if (file.size > MAX_FILE_SIZE) {
      return { attachment: null, error: `File too large. Max size is 5MB.` };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { attachment: null, error: `File type not allowed. Use images, PDF, ZIP, or text files.` };
    }

    const dataUrl = await this.readAsDataUrl(file);
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      bugId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy
    };

    this._attachments.update(list => {
      const updated = [...list, attachment];
      this.save(updated);
      return updated;
    });

    return { attachment, error: null };
  }

  remove(id: string): void {
    this._attachments.update(list => {
      const updated = list.filter(a => a.id !== id);
      this.save(updated);
      return updated;
    });
  }

  download(attachment: Attachment): void {
    const url = attachment.dataUrl;
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      console.error('Invalid attachment URL scheme');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.fileName;
    a.click();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  isImage(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private save(data: Attachment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage quota exceeded — silently fail
    }
  }

  private load(): Attachment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
