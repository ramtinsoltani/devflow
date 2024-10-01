import { Injectable } from '@angular/core';
import { Color, ITag, PaletteColor } from '@devflow/models';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /**
   * Converts a Color value to its counterpart PaletteColor value.
   * @param color Color value
   * @returns PaletteColor value
   */
  public getPaletteColor(color: Color): PaletteColor {

    return (PaletteColor as any)[Color[color]];

  }

  /**
   * Picks a random Color value without repeating the ones already in the sequence (if provided).
   * @param previousSequence An array of Color values (that has been previously picked) to exclude from selection (this array will be updated automatically)
   * @returns A random Color value
   */
  public pickRandomColor(previousSequence?: Color[]): Color {

    const colors: Color[] = Object.keys(Color).slice(0, Object.keys(Color).length / 2).map(c => +c);

    if ( previousSequence?.length === colors.length )
      previousSequence.length = 0;

    if ( previousSequence ) {

      for ( const color of previousSequence ) {

        const index = colors.findIndex(c => c === color);

        if ( index > -1 )
          colors.splice(index, 1);

      }

    }

    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    previousSequence?.push(pickedColor);

    return pickedColor;

  }

  /**
   * Returns an the last Color sequence from the given tags array.
   * @param tags An array of tags
   * @returns Last Color sequence
   */
  public resolveLastColorSequenceFromTags(tags: ITag[]): Color[] {

    return tags.slice(tags.length - (tags.length % (Object.keys(Color).length / 2))).map(t => t.color);

  }
  
}
