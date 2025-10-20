import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastronomiaPage } from './gastronomia.page';


describe('GastronomiaPage', () => {
 let component: GastronomiaPage;
 let fixture: ComponentFixture<GastronomiaPage>;


 beforeEach(() => {
   fixture = TestBed.createComponent(GastronomiaPage);
   component = fixture.componentInstance;
   fixture.detectChanges();
 });


 it('should create', () => {
   expect(component).toBeTruthy();
 });
});
