import { NgClass } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter, booleanAttribute, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color, ITag } from '@devflow/models';
import { EndpointService, UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import isURL from 'validator/es/lib/isURL';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-textbox',
  imports: [
    NgClass,
    IconComponent,
    FormsModule,
    TagComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss'
})
export class TextboxComponent implements OnInit, AfterViewInit {

  /** Indicates if host element is hovered */
  public hovered: boolean = false;
  /** Indicates if current URL is valid (only applicable if `type` is `url`) */
  public isUrlValid: boolean = false;

  @ViewChild('tagsContainer', { read: ElementRef })
  public tagsContainerEl!: ElementRef<HTMLDivElement>;

  @ViewChild('singleLineInput', { read: ElementRef })
  public singleLineInput?: ElementRef<HTMLInputElement>;

  @ViewChild('multilineInput', { read: ElementRef })
  public multilineInput?: ElementRef<HTMLTextAreaElement>;

  @HostListener('mouseenter')
  public onMouseEnter(): void {

    this.hovered = true;

  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {

    this.hovered = false;

  }

  @HostListener('keyup', ['$event'])
  public onKeyUp(event: KeyboardEvent) {

    event.stopPropagation();

  }

  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent) {

    event.stopPropagation();
    
  }

  @Input()
  public spaceId: string | null = null;

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

  /** Determines whether search events should be emitted when input is changed or when Enter is pressed */
  @Input({ transform: booleanAttribute })
  public emitSearchEventsOnChanges: boolean = false;

  /** Whether this textbox should have auto-focus or not */
  @Input({ transform: booleanAttribute })
  public autofocus: boolean = false;

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
    private utils: UtilsService,
    private endpoint: EndpointService
  ) { }

  ngOnInit(): void {
    
    if ( this.type === 'url' )
      this.checkUrlValue();
    
  }

  ngAfterViewInit(): void {
    
    if ( this.autofocus )
      (this.singleLineInput || this.multilineInput)?.nativeElement.focus();

  }

  private async createTag(value: string): Promise<void> {

    if ( ! value.trim() )
      return;

    // Avoid creating identical tags
    if ( this.tags.find(t => t.label.toLowerCase().trim() === value.toLowerCase().trim()) )
      return;

    let existingColor: Color | null = null;

    // Fetch tag color if it exists in current space
    if ( ! this.spaceId && ! this.monochromeTags ) {

      console.warn('Space ID was not set! Tag colors cannot be persisted.')

    }
    else if ( this.spaceId && ! this.monochromeTags) {

      try {

        existingColor = (await this.endpoint.getTagColor(this.spaceId, value.toLowerCase().trim())).color;

        // Update previous tags color sequence
        if ( existingColor !== null && ! this.previousTagsColorSequence.includes(existingColor) )
          this.previousTagsColorSequence.push(existingColor);

      }
      catch (error) {

        console.error(error);
        
      }

    }

    this.tags.push({
      label: value,
      color: existingColor ?? this.utils.pickRandomColor(this.previousTagsColorSequence)
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

    if ( this.emitSearchEventsOnChanges )
      this.onSearchTrigger();

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