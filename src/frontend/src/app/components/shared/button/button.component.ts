import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-button',
  imports: [IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  /** Button type */
  @Input()
  public type: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';

  /** Button label */
  @Input()
  public label?: string;

  /** Button disabled state */
  @Input({ transform: booleanAttribute })
  public disabled: boolean = false;

  /** Icon name (corresponds to filenames of `/assets/icons`) */
  @Input()
  public icon?: string;

  /** Icon CSS size (defaults to `1em`) */
  @Input()
  public iconSize: string = '1em';

  /** Icon container CSS size (defaults to `iconSize`) */
  @Input()
  public iconContainerSize?: string;

  /** Emits when button is pressed */
  @Output()
  public onClick = new EventEmitter<void>();

  public onButtonClick(): void {

    this.onClick.emit();

  }

}
