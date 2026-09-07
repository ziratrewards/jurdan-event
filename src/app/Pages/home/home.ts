import { Component, DestroyRef, NgZone, OnInit, computed, inject, signal } from '@angular/core';

import { Header } from "../../Layout/header/header";
import { RouterLink } from '@angular/router';

@Component({
  imports: [Header, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  formattedDays = computed(() => this.formatTime(this.days()));
  formattedHours = computed(() => this.formatTime(this.hours()));
  formattedMinutes = computed(() => this.formatTime(this.minutes()));
  formattedSeconds = computed(() => this.formatTime(this.seconds()));

  private intervalId?: ReturnType<typeof setInterval>;
  
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  eventDate = new Date('2026-09-18T16:00:00');

  ngOnInit(): void {
    this.updateCountdown();

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimer();
    });
  }

  private updateCountdown(): void {
    const now = Date.now();
    const eventTime = this.eventDate.getTime();

    const difference = eventTime - now;

    if (difference <= 0) {
      this.days.set(0);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);

      this.clearTimer();

      return;
    }

    this.days.set(
      Math.floor(difference / (1000 * 60 * 60 * 24))
    );

    this.hours.set(
      Math.floor(
        (difference % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
      )
    );

    this.minutes.set(
      Math.floor(
        (difference % (1000 * 60 * 60)) /
        (1000 * 60)
      )
    );

    this.seconds.set(
      Math.floor(
        (difference % (1000 * 60)) /
        1000
      )
    );
  }

  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}