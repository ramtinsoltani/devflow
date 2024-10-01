import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-placeholder',
  standalone: true,
  imports: [],
  templateUrl: './empty-placeholder.component.html',
  styleUrl: './empty-placeholder.component.scss'
})
export class EmptyPlaceholderComponent {

  public assetUrl?: string;

  @Input()
  public set assetFilename(filename: string) {

    if ( filename )
      this.assetUrl = `/assets/${filename}`;

  }

  @Input()
  public title?: string;

  @Input()
  public message?: string;

}
