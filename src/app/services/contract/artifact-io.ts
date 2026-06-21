export interface ArtifactIo {
  readonly filename: string;
  import(file: File): Promise<void>;
  export(): void;
}
