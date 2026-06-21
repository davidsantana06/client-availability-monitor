import { BehaviorSubject, Observable } from 'rxjs';

import { ArtifactIo } from '../contract/artifact-io';

export abstract class ArtifactStore<T> implements ArtifactIo {
  private readonly subject: BehaviorSubject<T>;
  readonly value$: Observable<T>;

  abstract readonly filename: string;

  constructor(seed: T) {
    this.subject = new BehaviorSubject<T>(seed);
    this.value$ = this.subject.asObservable();
  }

  get value(): T {
    return this.subject.value;
  }

  set(value: T): void {
    this.subject.next(value);
  }

  async import(file: File): Promise<void> {
    this.set(this.parse(await file.text()));
  }

  protected abstract parse(text: string): T;

  abstract export(): void;
}
