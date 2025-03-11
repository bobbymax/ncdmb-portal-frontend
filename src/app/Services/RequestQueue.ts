import CryptoJS from "crypto-js";

class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private SECRET_KEY = "ncdmb-staff-user";
  private IV = "1234567890123456";

  private encryptData(data: any): string {
    if (!this.SECRET_KEY) {
      throw new Error("Secret key is not set");
    }

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      CryptoJS.enc.Utf8.parse(this.SECRET_KEY), // Convert to WordArray
      {
        iv: CryptoJS.enc.Utf8.parse(this.IV), // Ensure IV matches backend
        mode: CryptoJS.mode.CBC, // Use CBC mode
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
  }

  // Generate identity marker
  private generateIdentityMarker(userId: string): string {
    const timestamp = Date.now();
    const payload = `${userId}:${timestamp}`;
    const signature = CryptoJS.HmacSHA256(payload, this.SECRET_KEY).toString();
    return `${payload}:${signature}`;
  }

  // Get device details
  private getDeviceDetails(): Record<string, string> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
    };
  }

  // Get current frontend URL
  private getCurrentURL(): string {
    return window.location.href;
  }

  // Add Requests to Queue
  addRequest(
    requestFn: (
      identityMarker?: string,
      metadata?: Record<string, string>
    ) => Promise<any>,
    userId?: string | null,
    retries = 3
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const executeRequest = async (attempt = 1) => {
        try {
          const identityMarker = userId
            ? this.generateIdentityMarker(userId)
            : undefined;

          const metadata = {
            frontendURL: this.getCurrentURL(),
            ...this.getDeviceDetails(),
          };
          const result = await requestFn(identityMarker, metadata);
          resolve(result);
        } catch (error) {
          if (attempt < retries) {
            console.warn(`Retrying request... Attempt ${attempt + 1}`);
            executeRequest(attempt + 1);
          } else {
            reject(error);
          }
        }
      };

      this.queue.push(() => executeRequest());
      this.processQueue();
    });
  }

  // Process requests one by one
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
      }
    }

    this.isProcessing = false;
  }
}

export const queue = new RequestQueue();
