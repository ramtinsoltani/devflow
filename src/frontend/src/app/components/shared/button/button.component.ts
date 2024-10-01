import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input()
  public type: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';

  @Input()
  public label?: string;

  @Input({ transform: booleanAttribute })
  public disabled: boolean = false;

  @Output()
  public onClick = new EventEmitter<void>();

  public onButtonClick(): void {

    this.onClick.emit();

  }

}
