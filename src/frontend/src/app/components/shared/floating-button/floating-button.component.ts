import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-floating-button',
  imports: [
    IconComponent,
    NgStyle
  ],
  templateUrl: './floating-button.component.html',
  styleUrl: './floating-button.component.scss'
})
export class FloatingButtonComponent {

  @Input()
  public icon!: string;

  @Input()
  public iconSize: string = '1em';

  @Input()
  public padding: string = '2em';

  @Output()
  public onClick = new EventEmitter<void>();

}
