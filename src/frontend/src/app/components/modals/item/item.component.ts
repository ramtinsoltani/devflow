import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Color, ITag } from '@devflow/models';
import { EndpointService, GenericModalComponent, IURLMetadataResponse, OnModalInit, OnModalOutput, OnModalValidation, UtilsService } from '@devflow/services';
import { cloneDeep } from 'lodash-es';
import { TextboxComponent } from '../../shared/textbox/textbox.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ItemImageComponent } from '../../shared/item-image/item-image.component';
import { CheckboxComponent } from '../../shared/checkbox/checkbox.component';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [
    TextboxComponent,
    IconComponent,
    ItemImageComponent,
    CheckboxComponent,
    NgClass,
    NgStyle,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemModalComponent implements GenericModalComponent, OnModalInit, OnModalOutput, OnModalValidation {

  /** Holds the last URL metadata that was fetched in this modal (if any) */
  public latestMetadata?: IURLMetadataResponse;
  public isUrlFetching: boolean = false;
  /** Holds the color sequence of tags when modal opened */
  public originalColorSequence: Color[] = [];
  /** Indicates if generated poster layout should be forced */
  public forceGeneratedPosterLayout: boolean = false;
  public forceGeneratedPosterLayoutOptionDisabled = true;

  @Input()
  public modalData: ItemModalData = {
    title: '',
    url: '',
    tags: [],
    forceAltLayout: false,
    collectionColor: Color.Blue
  };

  constructor(
    private endpoint: EndpointService,
    private utils: UtilsService
  ) { }

  onModalInit(): void {
    
    // Resolve the last color sequence of item tags (to not repeat tag colors when editing existing items, unless the sequence is restarted)
    this.originalColorSequence = this.utils.resolveLastColorSequenceFromTags(this.modalData.tags);

    this.forceGeneratedPosterLayout = this.modalData.forceAltLayout;

    const generatedLayoutCriteria: boolean = !! this.modalData.originTitle && !! this.modalData.originUrl && !! this.modalData.favicon;

    this.forceGeneratedPosterLayoutOptionDisabled = ! (generatedLayoutCriteria && this.modalData.posterUrl);

  }

  onModalOutput(): ItemModalOutput {

    return {
      title: this.modalData.title,
      description: this.modalData.description,
      tags: cloneDeep(this.modalData.tags),
      posterUrl: this.modalData.posterUrl,
      url: this.modalData.url,
      originTitle: this.latestMetadata?.originTitle || this.modalData.originTitle,
      originUrl: this.latestMetadata?.originUrl || this.modalData.originUrl,
      favicon: this.latestMetadata?.favicon || this.modalData.favicon,
      forceAltLayout: this.forceGeneratedPosterLayout
    };
    
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

      this.modalData.posterUrl = metadata.posterUrl;

      const generatedLayoutCriteria: boolean = !! metadata.originTitle && !! metadata.originUrl && !! metadata.favicon;
      
      this.forceGeneratedPosterLayoutOptionDisabled = ! (generatedLayoutCriteria && metadata.posterUrl);
      this.forceGeneratedPosterLayout = ! metadata.posterUrl && generatedLayoutCriteria;

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
  url: string,
  originTitle?: string,
  originUrl?: string,
  favicon?: string,
  forceAltLayout: boolean,
  collectionColor: Color
}

export interface ItemModalOutput {
  title: string,
  description?: string,
  tags: ITag[],
  posterUrl?: string,
  url: string,
  originTitle?: string,
  originUrl?: string,
  favicon?: string,
  forceAltLayout: boolean
}