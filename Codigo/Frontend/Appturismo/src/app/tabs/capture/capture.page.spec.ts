import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturePage } from './capture.page';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

class MockCaptureService {
  crearLugar = jasmine.createSpy('crearLugar').and.returnValue(Promise.resolve({
    id_lugares: 1,
    id_destino: 1,
    nombre: 'Test Place',
    categoria: 'Test Category',
    descripcion: 'Test Description',
    horario: '9:00-18:00'
  }));
  
  obtenerLugares = jasmine.createSpy('obtenerLugares').and.returnValue(Promise.resolve([]));
  actualizarLugar = jasmine.createSpy('actualizarLugar').and.returnValue(Promise.resolve());
  eliminarLugar = jasmine.createSpy('eliminarLugar').and.returnValue(Promise.resolve());
}

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;

  beforeEach(async () => {
    const mockCaptureService = new MockCaptureService();
    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

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
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly', () => {
    expect(component.lugares).toEqual([]);
    expect(component.nuevoLugar).toEqual({
      id_destino: 1,
      nombre: '',
      categoria: '',
      descripcion: '',
      horario: ''
    });
    expect(component.lugarEditando).toBeNull();
  });

  it('should validate form correctly', () => {
    component.nuevoLugar.nombre = 'Test';
    component.nuevoLugar.categoria = 'Category';
    expect(component['validarFormulario']()).toBeTrue();

    component.nuevoLugar.nombre = '';
    expect(component['validarFormulario']()).toBeFalse();
  });

  it('should clean form correctly', () => {
    component.nuevoLugar.nombre = 'Test';
    component['limpiarFormulario']();
    expect(component.nuevoLugar.nombre).toBe('');
  });

  it('should set editing place', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test',
      categoria: 'Category',
      descripcion: 'Desc',
      horario: '9-18'
    };
    
    component.editarLugar(testLugar);
    expect(component.lugarEditando).toEqual(testLugar);
  });

  it('should cancel editing', () => {
    component.lugarEditando = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test',
      categoria: 'Category',
      descripcion: 'Desc',
      horario: '9-18'
    };
    
    component.cancelarEdicion();
    expect(component.lugarEditando).toBeNull();
  });

  it('should track by lugar id', () => {
    const lugar = { id_lugares: 123 } as any;
    expect(component.trackByLugar(0, lugar)).toBe(123);
  });
});