import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { Color } from '@devflow/models';
import { UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [
    IconComponent,
    NgStyle,
    NgClass
  ],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss'
})
export class TagComponent {

  public finalColor: string = 'currentColor';
  public finalMonochromeTextColor: string = 'currentColor';
  public highContrast: boolean = false;

  @Input()
  public value!: string;

  @Input()
  public set color(value: Color) {

    this.finalColor = `var(--color-${this.utils.getPaletteColor(value)})`;
    this.highContrast = [Color.White, Color.Yellow].includes(value);

  }

  @Input({ transform: booleanAttribute })
  public monochrome: boolean = false;

  @Input()
  public set monochromeTextColor(value: string) {

    this.finalMonochromeTextColor = `var(--color-${value})`;

  }

  @Input({ transform: booleanAttribute })
  public removable: boolean = false;

  @Output()
  public onRemove = new EventEmitter<void>();

  constructor(
    private utils: UtilsService
  ) { }

  public onCloseButtonClick(): void {

    this.onRemove.emit();

  }

}
