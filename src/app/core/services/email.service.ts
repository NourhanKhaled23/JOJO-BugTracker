import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private initialized = false;

  constructor() {
    if (environment.emailjs.publicKey && !environment.emailjs.publicKey.startsWith('YOUR_')) {
      emailjs.init(environment.emailjs.publicKey);
      this.initialized = true;
    }
  }

  sendInvite(params: {
    to_name: string;
    to_email: string;
    from_name: string;
    invite_link: string;
    role: string;
  }): Promise<void> {
    if (!this.initialized) {
      return Promise.reject(new Error('EmailJS not configured. Set your EmailJS credentials in environment.ts'));
    }
    return emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      params
    ).then(() => undefined);
  }

  get isConfigured(): boolean {
    return this.initialized;
  }
}
