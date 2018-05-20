import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisDialogComponent } from './analysis-dialog.component';

describe('AnalysisDialogComponent', () => {
  let component: AnalysisDialogComponent;
  let fixture: ComponentFixture<AnalysisDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalysisDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
