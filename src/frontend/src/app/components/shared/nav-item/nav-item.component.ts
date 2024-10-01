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

  @Input()
  public highContrastAccentColor: boolean = false;

  @Input()
  public icon?: string;

  @Input()
  public iconSize: string = '1em';

  @Input()
  public iconContainerSize?: string;

  @Input()
  public set accentColor(value: string | undefined) {

    this.finalAccentColor = value ? `var(--color-${value})` : 'currentColor';
    this.highContrastAccentColor = [PaletteColor.White, PaletteColor.Yellow].includes(value as PaletteColor);

  }

  @Input()
  public label!: string;

  @Input()
  public badge?: string | number;

  @Input()
  public selected: boolean = false;

  @Input()
  public actionIcon?: string;

  @Input()
  public set actionIconHoverColor(value: string | undefined) {

    this.finalActionIconHoverColor = value ? `var(--color-${value})` : 'currentColor';
    
  }

  @Input()
  public actionIconSize: string = '1em';

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
