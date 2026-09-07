import { Injectable } from '@angular/core';
import { ZONES } from '../constants/zones.constant';
import { RGB } from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class SeatingMapService {

  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  
  private readonly SEARCH_RADIUS = 35;
  private readonly COLOR_TOLERANCE = 80;

  initialize(image: HTMLImageElement): void {
    this.canvas = document.createElement('canvas');

    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;

    const context = this.canvas.getContext('2d', {
      willReadFrequently: true
    });

    if (!context) {
      throw new Error('Unable to create canvas context');
    }

    this.context = context;

    this.context.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );
  }

  detectZone(x: number, y: number): string | null {
    if (!this.context) {
      return null;
    }

    const startX = Math.max(0, x - this.SEARCH_RADIUS);
    const startY = Math.max(0, y - this.SEARCH_RADIUS);
    const endX = Math.min(this.canvas.width - 1, x + this.SEARCH_RADIUS);
    const endY = Math.min(this.canvas.height - 1, y + this.SEARCH_RADIUS);
    
    const width = endX - startX + 1;
    const height = endY - startY + 1;

    if (width <= 0 || height <= 0) return null;

    const imageData = this.context.getImageData(startX, startY, width, height).data;

    const exactLocalX = x - startX;
    const exactLocalY = y - startY;
    const exactZone = this.matchPixelToZone(imageData, exactLocalX, exactLocalY, width);

    if (exactZone) {
      return this.formatZoneId(exactZone, x);
    }

    const votes = new Map<string, number>();

    for (let localY = 0; localY < height; localY++) {
      for (let localX = 0; localX < width; localX++) {
        const zone = this.matchPixelToZone(imageData, localX, localY, width);
        if (zone) {
          votes.set(zone, (votes.get(zone) || 0) + 1);
        }
      }
    }

    if (votes.size === 0) {
      return null;
    }

    let bestZone: string | null = null;
    let maxVotes = 0;

    for (const [zone, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        bestZone = zone;
      }
    }

    return bestZone ? this.formatZoneId(bestZone, x) : null;
  }

  private matchPixelToZone(imageData: Uint8ClampedArray, localX: number, localY: number, width: number): string | null {
    const index = (localY * width + localX) * 4;
    const a = imageData[index + 3];

    if (a === 0) {
      return null;
    }

    const pixelColor: RGB = {
      r: imageData[index],
      g: imageData[index + 1],
      b: imageData[index + 2]
    };

    let closestZone: string | null = null;
    let minDistance = this.COLOR_TOLERANCE;

    for (const zone of ZONES) {
      const distance = this.calculateColorDistance(pixelColor, zone.color);
      if (distance <= minDistance) {
        minDistance = distance;
        closestZone = zone.id;
      }
    }

    return closestZone;
  }

  private calculateColorDistance(c1: RGB, c2: RGB): number {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  }

  private formatZoneId(zoneId: string, x: number): string {
    if (zoneId === 'premium') {
      return x < this.canvas.width / 2 ? 'premium-left' : 'premium-right';
    }

    if (zoneId === 'vip') {
      return x < this.canvas.width / 2 ? 'vip-left' : 'vip-right';
    }

    return zoneId;
  }

  getImageCoordinates(event: MouseEvent, image: HTMLImageElement): { x: number; y: number } {
    const rect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;

    return {
      x: Math.floor((event.clientX - rect.left) * scaleX),
      y: Math.floor((event.clientY - rect.top) * scaleY)
    };
  }
}