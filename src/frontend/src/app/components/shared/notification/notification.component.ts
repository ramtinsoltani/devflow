import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { NotificationDef } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { NgClass } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    IconComponent,
    NgClass
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('.15s ease-in-out', style({
          opacity: 1
        }))
      ]),
      transition(':leave', [
        animate('.15s ease-in-out', style({
          opacity: 0
        }))
      ])
    ])
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {

  @HostBinding('@fadeInOut')
  public fadeInOut: boolean = true;

  /** Notification type */
  @Input()
  public type!: NotificationDef['type'];

  /** Notification message */
  @Input()
  public message!: string;

  /** Emits when notification should be destroyed */
  @Output()
  public onDestroy = new EventEmitter<void>();

  ngOnInit(): void {
    
    setTimeout(() => this.onDestroy.emit(), 3000);
    
  }

}
