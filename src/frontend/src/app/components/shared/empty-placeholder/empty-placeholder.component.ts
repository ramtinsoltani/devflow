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

  /** Asset filename to display in placeholder */
  @Input()
  public set assetFilename(filename: string) {

    if ( filename )
      this.assetUrl = `/assets/${filename}`;

  }

  /** Placeholder title */
  @Input()
  public title?: string;

  /** Placeholder message */
  @Input()
  public message?: string;

}
