import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturePage } from './capture.page';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

// Mock del servicio
class MockCaptureService {
  crearLugar = jasmine.createSpy('crearLugar').and.returnValue(Promise.resolve());
  obtenerLugares = jasmine.createSpy('obtenerLugares').and.returnValue(Promise.resolve([]));
  actualizarLugar = jasmine.createSpy('actualizarLugar').and.returnValue(Promise.resolve());
  eliminarLugar = jasmine.createSpy('eliminarLugar').and.returnValue(Promise.resolve());
}

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;
  let mockCaptureService: MockCaptureService;

  beforeEach(async () => {
    mockCaptureService = new MockCaptureService();

    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    // Configurar los spies para que devuelvan Promises resueltas
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    }));
    loadingControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve()
    }));
    toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    }));

    await TestBed.configureTestingModule({
      imports: [CapturePage],
      providers: [
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    })
    .overrideProvider('CaptureService', { useValue: mockCaptureService })
    .compileComponents();

    fixture = TestBed.createComponent(CapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty places list', () => {
    expect(component.lugares).toEqual([]);
  });

  it('should have initial new place object', () => {
    expect(component.nuevoLugar).toEqual({
      id_destino: 1,
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: '',
      precio: ''
    });
  });

  it('should not have editing place initially', () => {
    expect(component.lugarEditando).toBeNull();
  });

  it('should validate form correctly', () => {
    // Test de validación cuando el formulario está vacío
    component.nuevoLugar.nombre = '';
    component.nuevoLugar.categoria = '';
    
    // La validación debería fallar
    const result = component['validarFormulario']();
    expect(result).toBeFalse();
  });

  it('should clean form correctly', () => {
    component.nuevoLugar.nombre = 'Test Place';
    component.nuevoLugar.categoria = 'Test Category';
    component.nuevoLugar.descripcion = 'Test Description';
    
    component['limpiarFormulario']();
    
    expect(component.nuevoLugar.nombre).toBe('');
    expect(component.nuevoLugar.categoria).toBe('');
    expect(component.nuevoLugar.descripcion).toBe('');
  });

  it('should set editing place when editLugar is called', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00',
      precio: 'Gratis'
    };
    
    component.editarLugar(testLugar);
    
    expect(component.lugarEditando).toEqual(testLugar);
  });

  it('should cancel editing when cancelarEdicion is called', () => {
    component.lugarEditando = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00',
      precio: 'Gratis'
    };
    
    component.cancelarEdicion();
    
    expect(component.lugarEditando).toBeNull();
  });
});