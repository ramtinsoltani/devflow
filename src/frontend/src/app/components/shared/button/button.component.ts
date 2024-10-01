import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
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

  /** Emits when button is pressed */
  @Output()
  public onClick = new EventEmitter<void>();

  public onButtonClick(): void {

    this.onClick.emit();

  }

}
