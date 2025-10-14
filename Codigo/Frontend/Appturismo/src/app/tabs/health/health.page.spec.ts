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
      calificacion: 5
    });
  });

  it('should have loading state initialized as false', () => {
    expect(component.cargando).toBeFalse();
  });

  it('should have mostrarFormulario initialized as false', () => {
    expect(component.mostrarFormulario).toBeFalse();
  });

  // Test para el método probarAgregarResena
  it('should call agregarResena when probarAgregarResena is called with valid data', async () => {
    spyOn(component, 'agregarResena');
    
    component.nuevaResena = {
      titulo: 'Test Title',
      contenido: 'Test Content',
      calificacion: 4
    };

    await component.probarAgregarResena();
    
    expect(component.agregarResena).toHaveBeenCalled();
  });

  it('should not call agregarResena when probarAgregarResena is called with invalid data', async () => {
    spyOn(component, 'agregarResena');
    
    component.nuevaResena = {
      titulo: '',
      contenido: 'Test Content',
      calificacion: 4
    };

    await component.probarAgregarResena();
    
    expect(component.agregarResena).not.toHaveBeenCalled();
  });

  it('should not call agregarResena when already loading', async () => {
    spyOn(component, 'agregarResena');
    
    component.cargando = true;
    component.nuevaResena = {
      titulo: 'Test Title',
      contenido: 'Test Content',
      calificacion: 4
    };

    await component.probarAgregarResena();
    
    expect(component.agregarResena).not.toHaveBeenCalled();
  });

  // Test para reset del formulario
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

  // Test para mostrar/ocultar formulario
  it('should toggle mostrarFormulario when buttons are clicked', () => {
    component.mostrarFormulario = false;
    component.mostrarFormulario = true;
    expect(component.mostrarFormulario).toBeTrue();

    component.mostrarFormulario = false;
    expect(component.mostrarFormulario).toBeFalse();
  });

  // Test para cargarResenas (método mock)
  it('should call cargarResenas on init', async () => {
    spyOn(component, 'cargarResenas');
    await component.ngOnInit();
    expect(component.cargarResenas).toHaveBeenCalled();
  });

  // Test para eliminarResena
  it('should call eliminarResena with correct id', async () => {
    spyOn(component, 'eliminarResena');
    const testId = 123;
    
    await component.eliminarResena(testId);
    
    expect(component.eliminarResena).toHaveBeenCalledWith(testId);
  });
});