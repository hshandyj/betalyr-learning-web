export class VirtualUserManager {
    private static readonly STORAGE_KEY = 'virtual_user_id';
    private static readonly PREFIX = 'virtual_';

    static generateVirtualUserId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${this.PREFIX}${timestamp}_${random}`;
    }

    static getVirtualUserId(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.STORAGE_KEY);
    }

    static setVirtualUserId(): string {
        const virtualId = this.generateVirtualUserId();
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, virtualId);
        }
        return virtualId;
    }

    static removeVirtualUserId(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    static ensureVirtualUserId(): string {
        let virtualId = this.getVirtualUserId();
        if (!virtualId) {
            virtualId = this.setVirtualUserId();
        }
        return virtualId;
    }
} 