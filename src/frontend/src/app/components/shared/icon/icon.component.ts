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

  @Input()
  public set icon(value: string) {

    this.iconPath = `/assets/icons/${value}.svg`;

  }

  @Input()
  public iconWidth: string = '1em';

  @Input()
  public iconHeight: string = 'auto';

  @Input()
  public set iconSize(value: string) {

    this.iconWidth = value;
    this.iconHeight = value;

  }

  @Input()
  public containerWidth?: string;

  @Input()
  public containerHeight?: string;

  @Input()
  public set containerSize(value: string) {

    this.containerWidth = value;
    this.containerHeight = value;

  }

  @Input()
  public color: string = 'currentColor';

  @Input()
  public set paletteColor(value: string) {

    this.color = `var(--color-${value})`;

  }

}
