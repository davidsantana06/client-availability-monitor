import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

declare const bootstrap: any;

@Directive({ selector: '[appTooltip]' })
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') text = '';

  private readonly host = inject(ElementRef).nativeElement as HTMLElement;
  private tooltip: any;

  ngOnInit(): void {
    this.tooltip = new bootstrap.Tooltip(this.host, { title: this.text });
  }

  ngOnDestroy(): void {
    this.tooltip?.dispose();
  }
}
