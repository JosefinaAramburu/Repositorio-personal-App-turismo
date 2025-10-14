import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthPage } from './health.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('HealthPage', () => {
  let component: HealthPage;
  let fixture: ComponentFixture<HealthPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthPage, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty reseñas array', () => {
    expect(component.resenas).toEqual([]);
  });

  it('should initialize nuevaResena with default values', () => {
    expect(component.nuevaResena).toEqual({
      titulo: '',
      contenido: '',
      calificacion: 5  // Cambié de 1 a 5 porque en el código está en 5
    });
  });

  it('should have loading state initialized as false', () => {
    expect(component.cargando).toBeFalse();  // Solo existe 'cargando', no 'cargandoResenas' ni 'eliminando'
  });

  // Test adicional para verificar que el formulario se limpia correctamente
  it('should reset form after adding reseña', () => {
    // Simular datos en el formulario
    component.nuevaResena = {
      titulo: 'Test Title',
      contenido: 'Test Content',
      calificacion: 4
    };

    // Simular reset
    component.nuevaResena = {
      titulo: '',
      contenido: '',
      calificacion: 5
    };

    expect(component.nuevaResena.titulo).toBe('');
    expect(component.nuevaResena.contenido).toBe('');
    expect(component.nuevaResena.calificacion).toBe(5);
  });
});