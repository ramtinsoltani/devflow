import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color } from '@devflow/models';
import { GenericModalComponent, OnModalOutput, OnModalValidation, UtilsService } from '@devflow/services';
import { TextboxComponent } from '../../shared/textbox/textbox.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-collection-modal',
  standalone: true,
  imports: [
    FormsModule,
    TextboxComponent,
    IconComponent,
    NgClass
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionModalComponent implements GenericModalComponent, OnModalOutput, OnModalValidation, OnInit {

  constructor(
    public utils: UtilsService
  ) { }

  @Input()
  public modalData: CollectionModalData = {
    name: '',
    color: Color.Blue
  };

  public colorTuples: [Color, string][] = [];

  ngOnInit(): void {
    
    const colorTuples: any = Object.entries(Color).slice(0, Object.keys(Color).length / 2);

    for ( let i = 0; i < colorTuples.length; i++ ) {

      colorTuples[i][0] = +colorTuples[i][0];
      colorTuples[i][1] = this.utils.getPaletteColor(colorTuples[i][0]);

    }

    this.colorTuples = colorTuples;
    
  }

  public onColorChange(newColor: Color): void {

    this.modalData.color = newColor;

  }

  onModalOutput(): CollectionModalData {
    
    return this.modalData;
    
  }

  onModalValidation(): boolean {
    
    return !! this.modalData.name?.length;
    
  }

}

export interface CollectionModalData {
  name: string,
  color: Color
}