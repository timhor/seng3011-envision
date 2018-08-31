import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarityGraphComponent } from './similarity-graph.component';

describe('SimilarityGraphComponent', () => {
  let component: SimilarityGraphComponent;
  let fixture: ComponentFixture<SimilarityGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimilarityGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
