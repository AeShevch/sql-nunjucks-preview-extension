import * as fs from 'fs';
import * as path from 'path';

export class BundleEmbedder {
  private static bundleCache: string | null = null;

  public static getBundleSize(): number {
    return this.bundleCache ? this.bundleCache.length : 0;
  }

  public static getReactBundle(): string | undefined {
    if (this.bundleCache) {
      return this.bundleCache;
    }

    try {
      const bundlePath = path.join(__dirname, 'react-bundle.js');

      if (fs.existsSync(bundlePath)) {
        this.bundleCache = fs.readFileSync(bundlePath, 'utf8');
        return this.bundleCache;
      }
    } catch (error) {
      console.error('Failed to load React bundle:', error);
      return 'Failed to load React bundle';
    }
  }

  public static clearCache(): void {
    this.bundleCache = null;
  }
}
