import { Component, Input, Output, HostListener, EventEmitter } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { NgStyle, NgClass } from '@angular/common';
import { PaletteColor } from '@devflow/models';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [
    IconComponent,
    NgStyle,
    NgClass
  ],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {

  public finalAccentColor: string = 'currentColor';
  public finalActionIconHoverColor: string = 'currentColor';
  public hovered: boolean = false;
  public actionIconHovered: boolean = false;

  /** Enables high contrast mode between inside badge (used for light accent colors, automatically set for `Color.Yellow` and `Color.White`) */
  @Input()
  public highContrastAccentColor: boolean = false;

  /** Icon name (corresponds to filenames of `/assets/icons`) */
  @Input()
  public icon?: string;

  /** Icon CSS size (defaults to `1em`) */
  @Input()
  public iconSize: string = '1em';

  /** Icon container CSS size (defaults to `iconSize`) */
  @Input()
  public iconContainerSize?: string;

  /** Nav item accent color (defaults to `currentColor`) */
  @Input()
  public set accentColor(value: string | undefined) {

    this.finalAccentColor = value ? `var(--color-${value})` : 'currentColor';
    this.highContrastAccentColor = [PaletteColor.White, PaletteColor.Yellow].includes(value as PaletteColor);

  }

  /** Nav item label */
  @Input()
  public label!: string;

  /** Nav item badge */
  @Input()
  public badge?: string | number;

  /** Indicates if current nav item is selected */
  @Input()
  public selected: boolean = false;

  /** Nav item action icon (corresponds to filenames in `/assets/icons`) */
  @Input()
  public actionIcon?: string;

  /** Hover color of the action icon */
  @Input()
  public set actionIconHoverColor(value: string | undefined) {

    this.finalActionIconHoverColor = value ? `var(--color-${value})` : 'currentColor';
    
  }

  /** Action icon CSS size (defaults to `1em`) */
  @Input()
  public actionIconSize: string = '1em';

  /** Action icon container CSS size (defaults to `actionIconSize`) */
  @Input()
  public actionIconContainerSize?: string;

  @HostListener('mouseenter')
  public onMouseEnter(): void {

    this.hovered = true;

  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {

    this.hovered = false;

  }

  /** Emits when action button (if any) is pressed */
  @Output()
  public onAction = new EventEmitter();

  public onActionIconMouseEnter(): void {

    this.actionIconHovered = true;

  }

  public onActionIconMouseLeave(): void {

    this.actionIconHovered = false;

  }

  public onActionIconClick(event: MouseEvent): void {

    event.preventDefault();
    event.stopImmediatePropagation();

    this.onAction.emit();

  }

}
