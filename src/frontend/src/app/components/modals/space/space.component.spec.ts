import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceModalComponent } from './space.component';

describe('SpaceModalComponent', () => {
  let component: SpaceModalComponent;
  let fixture: ComponentFixture<SpaceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
