import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturePage } from './capture.page';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CaptureService } from './capture.page';

// Mock del servicio
class MockCaptureService {
  crearLugar = jasmine.createSpy('crearLugar').and.returnValue(Promise.resolve({
    id_lugares: 1,
    id_destino: 1,
    nombre: 'Test Place',
    categoria: 'Test Category',
    descripcion: 'Test Description',
    horario: '9:00-18:00'
  }));
  
  obtenerLugares = jasmine.createSpy('obtenerLugares').and.returnValue(Promise.resolve([
    {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place 1',
      categoria: 'Test Category',
      descripcion: 'Test Description 1',
      horario: '9:00-18:00'
    },
    {
      id_lugares: 2,
      id_destino: 1,
      nombre: 'Test Place 2',
      categoria: 'Test Category 2',
      descripcion: 'Test Description 2',
      horario: '10:00-20:00'
    }
  ]));
  
  actualizarLugar = jasmine.createSpy('actualizarLugar').and.returnValue(Promise.resolve({
    id_lugares: 1,
    id_destino: 1,
    nombre: 'Updated Place',
    categoria: 'Updated Category',
    descripcion: 'Updated Description',
    horario: '10:00-19:00'
  }));
  
  eliminarLugar = jasmine.createSpy('eliminarLugar').and.returnValue(Promise.resolve());
}

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;
  let mockCaptureService: MockCaptureService;

  beforeEach(async () => {
    mockCaptureService = new MockCaptureService();

    // Crear spies para los controladores de Ionic
    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    // Configurar los spies para que devuelvan Promises resueltas
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ role: 'cancel' })
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
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: CaptureService, useValue: mockCaptureService }
      ]
    }).compileComponents();

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

  it('should have initial new place object without precio', () => {
    expect(component.nuevoLugar).toEqual({
      id_destino: 1,
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: ''
    });
  });

  it('should not have editing place initially', () => {
    expect(component.lugarEditando).toBeNull();
  });

  it('should validate form correctly when empty', () => {
    // Test de validación cuando el formulario está vacío
    component.nuevoLugar.nombre = '';
    component.nuevoLugar.categoria = '';
    
    const result = component['validarFormulario']();
    expect(result).toBeFalse();
  });

  it('should validate form correctly when filled', () => {
    // Test de validación cuando el formulario está completo
    component.nuevoLugar.nombre = 'Test Place';
    component.nuevoLugar.categoria = 'Test Category';
    
    const result = component['validarFormulario']();
    expect(result).toBeTrue();
  });

  it('should clean form correctly', () => {
    // Llenar el formulario
    component.nuevoLugar.nombre = 'Test Place';
    component.nuevoLugar.categoria = 'Test Category';
    component.nuevoLugar.descripcion = 'Test Description';
    component.nuevoLugar.horario = '9:00-18:00';
    
    // Limpiar formulario
    component['limpiarFormulario']();
    
    // Verificar que se limpió correctamente
    expect(component.nuevoLugar.nombre).toBe('');
    expect(component.nuevoLugar.categoria).toBe('');
    expect(component.nuevoLugar.descripcion).toBe('');
    expect(component.nuevoLugar.horario).toBe('');
  });

  it('should set editing place when editLugar is called', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00'
    };
    
    component.editarLugar(testLugar);
    
    expect(component.lugarEditando).toEqual(testLugar);
  });

  it('should cancel editing when cancelarEdicion is called', () => {
    // Configurar un lugar en edición
    component.lugarEditando = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00'
    };
    
    component.cancelarEdicion();
    
    expect(component.lugarEditando).toBeNull();
  });

  it('should validate edit form correctly', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00'
    };
    
    component.lugarEditando = { ...testLugar };
    
    const result = component['validarFormularioEdicion']();
    expect(result).toBeTrue();
  });

  it('should track by lugar id', () => {
    const testLugar = {
      id_lugares: 123,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00'
    };
    
    const result = component.trackByLugar(0, testLugar);
    expect(result).toBe(123);
  });

  it('should call cargarLugares on init', async () => {
    spyOn(component, 'cargarLugares').and.callThrough();
    
    component.ngOnInit();
    
    expect(component.cargarLugares).toHaveBeenCalled();
  });

  it('should handle crearLugar successfully', async () => {
    // Configurar datos válidos
    component.nuevoLugar.nombre = 'New Place';
    component.nuevoLugar.categoria = 'New Category';
    component.nuevoLugar.descripcion = 'New Description';
    component.nuevoLugar.horario = '9:00-18:00';
    
    // Espiar métodos internos
    spyOn(component as any, 'mostrarExito').and.stub();
    
    await component.crearLugar();
    
    expect(mockCaptureService.crearLugar).toHaveBeenCalled();
  });

  it('should not call crearLugar when form is invalid', async () => {
    // Configurar datos inválidos
    component.nuevoLugar.nombre = '';
    component.nuevoLugar.categoria = '';
    
    await component.crearLugar();
    
    expect(mockCaptureService.crearLugar).not.toHaveBeenCalled();
  });
});