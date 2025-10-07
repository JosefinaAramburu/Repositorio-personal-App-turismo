import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CapturePage } from './capture.page';


describe('CapturePage', () => {
 let component: CapturePage;
 let fixture: ComponentFixture<CapturePage>;


 beforeEach(async () => {
   await TestBed.configureTestingModule({
     declarations: [CapturePage],
     imports: [
       CommonModule,   // para *ngIf y *ngFor
       FormsModule,    // si tu página usa formularios
       IonicModule.forRoot()  // necesario para componentes <ion-*>
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


