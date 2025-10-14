import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturePage } from './capture.page';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CapturePage],
      providers: [
        { provide: Router, useValue: {} },
        { provide: AlertController, useValue: {} },
        { provide: LoadingController, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});