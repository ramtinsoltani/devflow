import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationsModalComponent } from './invitations.component';

describe('InvitationsModalComponent', () => {
  let component: InvitationsModalComponent;
  let fixture: ComponentFixture<InvitationsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
