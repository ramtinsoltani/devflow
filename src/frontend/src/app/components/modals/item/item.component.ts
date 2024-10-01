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

  /** Holds the last URL metadata that was fetched in this modal (if any) */
  private latestMetadata?: IURLMetadataResponse;
  public isUrlFetching: boolean = false;
  /** Holds the color sequence of tags when modal opened */
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
    
    // Resolve the last color sequence of item tags (to not repeat tag colors when editing existing items, unless the sequence is restarted)
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

    // Fetch URL metadata
    this.endpoint.fetchMetadata(url)
    .then(metadata => {

      // Only overwrite title if it was not touched from the last fetched metadata (if any)
      if ( metadata.title && (! this.latestMetadata?.title || this.modalData.title === this.latestMetadata?.title) )
        this.modalData.title = metadata.title;

      // Only overwrite description if it was not touched from the last fetched metadata (if any)
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