import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {

  public iconPath?: string;

  /** Icon name (corresponds to filenames in "/assets/icons") */
  @Input()
  public set icon(value: string) {

    this.iconPath = `/assets/icons/${value}.svg`;

  }

  /** Icon CSS width (defaults to `1em`) */
  @Input()
  public iconWidth: string = '1em';

  /** Icon CSS height (defaults to `auto`) */
  @Input()
  public iconHeight: string = 'auto';

  /** Icon CSS width and height (square size, defaults to `iconWidth` and `iconHeight`) */
  @Input()
  public set iconSize(value: string) {

    this.iconWidth = value;
    this.iconHeight = value;

  }

  /** Icon container CSS width (defaults to `iconWidth`) */
  @Input()
  public containerWidth?: string;

  /** Icon container CSS height (defaults to `iconHeight`) */
  @Input()
  public containerHeight?: string;

  /** Icon container CSS width and height (square size, defaults to `iconSize`) */
  @Input()
  public set containerSize(value: string) {

    this.containerWidth = value;
    this.containerHeight = value;

  }

  /** Icon CSS color (defaults to `currentColor`) */
  @Input()
  public color: string = 'currentColor';

  /** Icon palette color (e.g. CSS variable name) */
  @Input()
  public set paletteColor(value: string) {

    this.color = `var(--color-${value})`;

  }

}
