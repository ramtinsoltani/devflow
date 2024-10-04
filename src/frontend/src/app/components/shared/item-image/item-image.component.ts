import { NgClass, NgStyle } from '@angular/common';
import { booleanAttribute, Component, Input } from '@angular/core';
import { Color } from '@devflow/models';
import { UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-item-image',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    IconComponent
  ],
  templateUrl: './item-image.component.html',
  styleUrl: './item-image.component.scss'
})
export class ItemImageComponent {

  /** Indicates if an existing poster image failed to load */
  public brokenPosterImage: boolean = false;
  /** Holds the provided poster image URL */
  public posterImageUrl?: string;

  constructor(
    private utils: UtilsService
  ) { }

  @Input()
  public bright: boolean = false;

  @Input()
  public set posterUrl(value: string | undefined) {

    this.brokenPosterImage = false;
    this.posterImageUrl = value;

  }

  /** Title to be displayed in the generated layout */
  @Input()
  public title?: string;

  /** URL to be displayed in the generated layout */
  @Input()
  public url?: string;

  /** Favicon URL to be displayed in the generated layout */
  @Input()
  public favicon?: string;

  /** Current collection color */
  @Input()
  public collectionColor!: Color;

  /** Forces the generated layout to be displayed */
  @Input({ transform: booleanAttribute })
  public forceGeneratedLayout: boolean = false;

  /**
   * Handles poster image loading failures.
   */
  public onImageLoadingError(): void {

    this.brokenPosterImage = true;

  }

  /**
   * Generates a CSS gradient based on current collection color.
   * @returns CSS gradient string
   */
  public getCollectionColorGradient(): string {

    const collectionColor = `var(--color-${this.utils.getPaletteColor(this.collectionColor)})`;
    const opaqueColor = `color-mix(in srgb, ${collectionColor} ${this.bright ? 60 : 30}%, var(--color-gray-2))`;

    return `radial-gradient(ellipse 75% 100% at 50% 100%, ${opaqueColor}, var(--color-gray-2))`;

  }

  /**
   * Indicates if the generated layout should be displayed based on the component input.
   */
  public shouldDisplayGeneratedLayout(): boolean { 

    return this.forceGeneratedLayout || (! this.posterImageUrl && !! this.title && !! this.url && !! this.favicon);

  }
  
}
