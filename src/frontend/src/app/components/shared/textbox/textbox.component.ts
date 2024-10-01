import { NgClass } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter, booleanAttribute, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color, ITag } from '@devflow/models';
import { UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import { isURL } from 'validator';

// On value change, we check the url, if valid, we enable the link button (favicon 'link')
// When clicked, metadata will be fetched and emitted
// Clear button will delete link and emit null metadata

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

  public hovered: boolean = false;
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

  @Input()
  public placeholder?: string;

  @Input()
  public type: 'text' | 'search' | 'url' | 'multiline' = 'text';

  @Input()
  public label?: string;

  @Input({ transform: booleanAttribute })
  public withTags: boolean = false;

  @Input({ transform: booleanAttribute })
  public monochromeTags: boolean = false;

  @Input()
  public previousTagsColorSequence: Color[] = [];

  @Input()
  public searchOnTagsChange: boolean = true;

  @Input()
  public showUrlClearButton: boolean = false;

  @Input()
  public showUrlLoading: boolean = false;

  @Input()
  public multilineMaxAllowedChars?: number;

  @Input()
  public tags: ITag[] = [];

  @Output()
  public tagsChange = new EventEmitter<ITag[]>();

  @Input()
  public value: string | undefined = '';

  @Output()
  public valueChange = new EventEmitter<string>();

  @Output()
  public onSearch = new EventEmitter<TextboxSearchEvent>();

  @Output()
  public onClear = new EventEmitter<void>();

  @Output()
  public onUrlSubmit = new EventEmitter<string>();

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

    if ( this.withTags && value.charAt(value.length - 1) === ',' ) {

      this.value = '';

      this.createTag(value.substring(0, value.length - 1));
      value = '';

      if ( this.searchOnTagsChange )
        this.onSearchTrigger();

    }

    this.value = value;
    this.valueChange.emit(this.value);
    
    inputRef.value = this.value;

    if ( this.type === 'url' )
      this.checkUrlValue();

  }

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