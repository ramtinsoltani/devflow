import { NgClass } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter, booleanAttribute, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color, ITag } from '@devflow/models';
import { UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import { isURL } from 'validator';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [
    NgClass,
    IconComponent,
    FormsModule,
    TagComponent
  ],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss'
})
export class TextboxComponent implements OnInit {

  /** Indicates if host element is hovered */
  public hovered: boolean = false;
  /** Indicates if current URL is valid (only applicable if `type` is `url`) */
  public isUrlValid: boolean = false;

  @ViewChild('tagsContainer', { read: ElementRef })
  public tagsContainerEl!: ElementRef<HTMLDivElement>;

  @HostListener('mouseenter')
  public onMouseEnter(): void {

    this.hovered = true;

  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {

    this.hovered = false;

  }

  /** Textbox placeholder */
  @Input()
  public placeholder?: string;

  /** Textbox type */
  @Input()
  public type: 'text' | 'search' | 'url' | 'multiline' = 'text';

  /** Textbox label (will be displayed on top of textbox) */
  @Input()
  public label?: string;

  /** Indicates if textbox can have tags (not applicable to type `multiline`) */
  @Input({ transform: booleanAttribute })
  public withTags: boolean = false;

  /** Indicates if tags should be monochrome (only applicable if `withTags` is true) */
  @Input({ transform: booleanAttribute })
  public monochromeTags: boolean = false;

  /** Previous Color sequence of tags (will be used to not repeat the same tag colors, until all colors are used and sequence is cleared) */
  @Input()
  public previousTagsColorSequence: Color[] = [];

  /** Indicates if search should be triggered when tags are created/deleted (only applicable if `withTags` is true and if `type` is `search`) */
  @Input()
  public searchOnTagsChange: boolean = true;

  /** Indicates if a clear button for URL textbox should be shown (only applicable if `type` is `url`) */
  @Input()
  public showUrlClearButton: boolean = false;

  /** Indicates if URL is being loaded/fetched (only applicable if `type` is `url`) */
  @Input()
  public showUrlLoading: boolean = false;

  /** Defines the maximum allowed characters for multiline textbox (only applicable if `type` is `multiline`) */
  @Input()
  public multilineMaxAllowedChars?: number;

  /** Textbox tags (only applicable if `withTags` is true) */
  @Input()
  public tags: ITag[] = [];

  /** Emits when tags change (only applicable if `withTags` is true) */
  @Output()
  public tagsChange = new EventEmitter<ITag[]>();

  /** Textbox value */
  @Input()
  public value: string | undefined = '';

  /** Emits when textbox value changes */
  @Output()
  public valueChange = new EventEmitter<string>();

  /** Emits when textbox search is triggered (only applicable if `type` is `search`) */
  @Output()
  public onSearch = new EventEmitter<TextboxSearchEvent>();

  /** Emits when clear button is pressed (only applicable if either `type` is `search`) */
  @Output()
  public onClear = new EventEmitter<void>();

  /** Emits when URL is submitted (only applicable if `type` is `url`) */
  @Output()
  public onUrlSubmit = new EventEmitter<string>();

  /** Emits when URL is cleared (only applicable if `type` is `url` and `showUrlClearButton` is true) */
  @Output()
  public onUrlClear = new EventEmitter<void>();

  constructor(
    private utils: UtilsService
  ) { }

  ngOnInit(): void {
    
    if ( this.type === 'url' )
      this.checkUrlValue();
    
  }

  private createTag(value: string): void {

    if ( ! value.trim() )
      return;

    this.tags.push({
      label: value,
      color: this.utils.pickRandomColor(this.previousTagsColorSequence)
    });

    this.tagsChange.emit(this.tags);

    // Smooth scroll to the newly created tag
    setTimeout(() => {

      this.tagsContainerEl?.nativeElement.scrollTo({
        top: 0,
        left: this.tagsContainerEl?.nativeElement.scrollWidth,
        behavior: 'smooth'
      });

    });

  }

  public onDeleteTag(index: number): void {

    this.tags.splice(index, 1);
    this.tagsChange.emit(this.tags);

    if ( this.searchOnTagsChange )
      this.onSearchTrigger();

  }

  public onValueChange(value: string, inputRef: HTMLInputElement | HTMLTextAreaElement): void {

    // If tags are enabled and last typed character is ","
    if ( this.withTags && value.charAt(value.length - 1) === ',' ) {

      // Clear current value
      this.value = '';

      // Create tag
      this.createTag(value.substring(0, value.length - 1));
      // Clear local value
      value = '';

      if ( this.searchOnTagsChange )
        this.onSearchTrigger();

    }

    // Update value
    this.value = value;
    this.valueChange.emit(this.value);
    
    // Manually update input value (needed in certain cases when ngModel won't pick up the value change)
    inputRef.value = this.value;

    if ( this.type === 'url' )
      this.checkUrlValue();

  }

  /** Updates the validity state of the current URL */
  public checkUrlValue(): void {

    if ( this.value === undefined )
      return;

    this.isUrlValid = isURL(this.value.trim(), {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    });

  }

  public onSearchTrigger(): void {

    if ( this.value === undefined )
      return;

    this.onSearch.emit({ value: this.value, tags: this.tags });

  }

  public onEnterPress(): void {

    if ( this.type === 'search' )
      this.onSearchTrigger();
    else if ( this.type === 'url' )
      this.onLinkButtonClick();

  }

  public onSearchClear(): void {

    this.value = '';
    this.tags = [];
    this.previousTagsColorSequence = [];

    this.onClear.emit();

  }

  public onLinkButtonClick(): void {

    if ( this.value === undefined )
      return;

    if ( this.type === 'url' && this.isUrlValid )
      this.onUrlSubmit.emit(this.value.trim());

  }

  public onClearButtonClick(): void {

    if ( this.type === 'search' )
      this.onSearchClear();
    else if ( this.type === 'url' )
      this.onUrlClear.emit();

  }

  public getPlaceholder(): string {

    let placeholder: string = `${this.placeholder || ''}`;

    if ( this.type !== 'multiline' ) {

      if ( this.withTags && this.placeholder )
        placeholder += ' (type comma to create tags)';
      else if ( this.withTags )
        placeholder = `Type comma to create tags`;

    }

    return placeholder;

  }

}

export interface TextboxSearchEvent {
  value: string,
  tags: ITag[]
}