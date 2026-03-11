import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingMessageSubject = new BehaviorSubject<string>('Loading...');
  public loadingMessage$: Observable<string> =
    this.loadingMessageSubject.asObservable();

  constructor() {}

  /**
   * Show the global loading indicator
   * @param message Optional custom loading message
   */
  show(message: string = 'Loading...') {
    this.loadingMessageSubject.next(message);
    this.loadingSubject.next(true);
  }

  /**
   * Hide the global loading indicator
   */
  hide() {
    this.loadingSubject.next(false);
  }

  /**
   * Check if loading is active
   */
  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  /**
   * Get current loading message
   */
  getMessage(): Observable<string> {
    return this.loadingMessage$;
  }
}
