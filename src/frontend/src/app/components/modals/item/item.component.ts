import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Color, ITag } from '@devflow/models';
import { EndpointService, GenericModalComponent, IURLMetadataResponse, OnModalInit, OnModalOutput, OnModalValidation, UtilsService } from '@devflow/services';
import { TextboxComponent } from '../../shared/textbox/textbox.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [
    TextboxComponent,
    IconComponent,
    NgClass,
    NgStyle
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemModalComponent implements GenericModalComponent, OnModalInit, OnModalOutput, OnModalValidation {

  private latestMetadata?: IURLMetadataResponse;
  public isUrlFetching: boolean = false;
  public originalColorSequence: Color[] = [];

  @Input()
  public modalData: ItemModalData = {
    title: '',
    url: '',
    tags: []
  };

  constructor(
    private endpoint: EndpointService,
    private utils: UtilsService
  ) { }

  onModalInit(): void {
    
    this.originalColorSequence = this.utils.resolveLastColorSequenceFromTags(this.modalData.tags);
  }

  onModalOutput(): ItemModalData {

    return this.modalData;
    
  }

  onModalValidation(): boolean {
    
    return (!! this.modalData.url.length) && (!! this.modalData.title?.length);
    
  }

  public onClearUrl(): void {

    this.modalData.url = '';
    this.modalData.posterUrl = '';
    
    this.isUrlFetching = false;

  }

  public onSubmitUrl(url: string): void {

    if ( this.modalData.url === url )
      return;

    this.modalData.url = url;
    this.isUrlFetching = true;

    this.endpoint.fetchMetadata(url)
    .then(metadata => {

      if ( metadata.title && (! this.latestMetadata?.title || this.modalData.title === this.latestMetadata?.title) )
        this.modalData.title = metadata.title;

      if ( metadata.description && (! this.latestMetadata?.description || this.modalData.description === this.latestMetadata?.description) )
        this.modalData.description = metadata.description;

      if ( metadata.posterUrl )
        this.modalData.posterUrl = metadata.posterUrl;

      this.latestMetadata = metadata;

    })
    .catch(error => console.error(error))
    .finally(() => this.isUrlFetching = false);

  }

}

export interface ItemModalData {
  title: string,
  description?: string,
  tags: ITag[],
  posterUrl?: string,
  url: string
}