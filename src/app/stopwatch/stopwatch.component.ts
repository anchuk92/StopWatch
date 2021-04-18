import {Component, OnInit} from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {buffer, debounceTime, filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.css']
})
export class StopwatchComponent implements OnInit {

  stream$: Observable<any>;
  sub: Subscription;
  isStarted = false;
  waiting = false;
  paused = false;
  startText = 'Start';
  seconds = 1;
  time = '00:00:00';

  ngOnInit(): void {
    this.stream$ = new Observable(observer => {
      let currentTime = 1;
      if (true === this.waiting) {
        currentTime = this.seconds;
      }
      setInterval(() => {
        observer.next(currentTime);
        currentTime++;
      }, 1000);
    });
  }

  startStop(): void {
    if (false === this.isStarted) {
      this.isStarted = true;
      this.startText = 'Stop';
      this.changeTime(true);
    } else {
      this.startText = 'Start';
      this.resetTime();
      this.changeTime(false);
    }
  }

  reset(): void {
    if (false === this.isStarted) {
      return;
    }
    this.resetTime();
    this.changeTime(false);
    this.changeTime(true);
    this.isStarted = true;
  }

  wait(): void {
    const clicks$ = fromEvent(document.getElementById('waitBtn'), 'click');
    clicks$
      .pipe(
        buffer(clicks$.pipe(debounceTime(300))),
        map((list) => {
          return list.length;
        }),
        filter((x) => x === 2)
      ).subscribe(() => {
      this.changeTime(false);
      this.isStarted = false;
      this.paused = true;
      this.waiting = true;
      this.startText = 'Start';
    });
  }

  changeTime(subscribe: boolean): void {
    if (true === subscribe) {
      this.sub = this.stream$.subscribe(
        (secondsPassed: number) => {
          this.seconds = secondsPassed;
          const seconds = this.formatTime(secondsPassed % 60);
          const minutes = this.formatTime(Math.floor((secondsPassed / 60) % 60));
          const hours = this.formatTime(Math.floor((secondsPassed / 3600) % 3600));
          this.time = hours + ':' + minutes + ':' + seconds;
        },
      );
    } else {
      this.sub.unsubscribe();
    }
  }

  resetTime(): void {
    this.isStarted = false;
    this.seconds = 1;
    this.time = '00:00:00';
  }

  formatTime(time): string {
    return time < 10 ? '0' + time : time;
  }
}
