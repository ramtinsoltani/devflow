import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    IconComponent
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {

  @Input({ transform: booleanAttribute })
  public checked: boolean = false;

  @Output()
  public checkedChange = new EventEmitter<boolean>();

  @Input({ transform: booleanAttribute })
  public disabled: boolean = false;

  @Output()
  public disabledChange = new EventEmitter<boolean>();

  @Input()
  public label?: string;

  @Output()
  public labelChange = new EventEmitter<string>();

  /** Static UID which each instance of the class will increment and use as input element ID */
  private static uid: number = 0;

  /** Unique ID for this instance based on the static UID */
  public idString: string = `cb${CheckboxComponent.uid++}`;

}
