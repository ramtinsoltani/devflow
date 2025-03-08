import { Component, Input } from '@angular/core';
import { GenericModalComponent, OnModalOutput, OnModalValidation } from '@devflow/services';
import { TextboxComponent } from '../../shared/textbox/textbox.component';

@Component({
  selector: 'app-space',
  imports: [TextboxComponent],
  templateUrl: './space.component.html',
  styleUrl: './space.component.scss'
})
export class SpaceModalComponent implements GenericModalComponent, OnModalOutput, OnModalValidation {

  @Input()
  public modalData: SpaceModalData = {
    name: ''
  };

  onModalOutput(): SpaceModalData {
      
    return this.modalData;
    
  }

  onModalValidation(): boolean {
    
    return !! this.modalData.name?.length;
    
  }
  
}

export interface SpaceModalData {
  name: string
}