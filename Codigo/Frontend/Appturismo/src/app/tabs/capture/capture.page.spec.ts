import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturePage } from './capture.page';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';

class MockCaptureService {
  crearLugar = jasmine.createSpy('crearLugar').and.returnValue(Promise.resolve({
    id_lugares: 1,
    id_destino: 1,
    nombre: 'Test Place',
    categoria: 'Test Category',
    descripcion: 'Test Description',
    horario: '9:00-18:00',
    totalResenas: 0,
    promedioRating: 0
  }));
  
  obtenerLugares = jasmine.createSpy('obtenerLugares').and.returnValue(Promise.resolve([]));
  actualizarLugar = jasmine.createSpy('actualizarLugar').and.returnValue(Promise.resolve());
  eliminarLugar = jasmine.createSpy('eliminarLugar').and.returnValue(Promise.resolve());
  obtenerEstadisticasResenas = jasmine.createSpy('obtenerEstadisticasResenas').and.returnValue(Promise.resolve({
    totalResenas: 0,
    promedioRating: 0
  }));
}

class MockNavController {
  navigateForward = jasmine.createSpy('navigateForward');
}

describe('CapturePage', () => {
  let component: CapturePage;
  let fixture: ComponentFixture<CapturePage>;

  beforeEach(async () => {
    const mockCaptureService = new MockCaptureService();
    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

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
        { provide: NavController, useValue: navControllerSpy }
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
      horario: '',
      totalResenas: 0,
      promedioRating: 0
    });
    expect(component.lugarEditando).toBeNull();
  });

  it('should validate form correctly', () => {
    // Acceder a métodos privados usando bracket notation
    component.nuevoLugar.nombre = 'Test';
    component.nuevoLugar.categoria = 'Category';
    expect(component['validarFormulario']()).toBeTrue();

    component.nuevoLugar.nombre = '';
    expect(component['validarFormulario']()).toBeFalse();
  });

  it('should clean form correctly', () => {
    component.nuevoLugar.nombre = 'Test';
    component.nuevoLugar.totalResenas = 5;
    component.nuevoLugar.promedioRating = 4.5;
    
    component['limpiarFormulario']();
    
    expect(component.nuevoLugar.nombre).toBe('');
    expect(component.nuevoLugar.totalResenas).toBe(0);
    expect(component.nuevoLugar.promedioRating).toBe(0);
  });

  it('should set editing place', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test',
      categoria: 'Category',
      descripcion: 'Desc',
      horario: '9-18',
      totalResenas: 3,
      promedioRating: 4.2
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
      horario: '9-18',
      totalResenas: 3,
      promedioRating: 4.2
    };
    
    component.cancelarEdicion();
    expect(component.lugarEditando).toBeNull();
  });

  it('should track by lugar id', () => {
    const lugar = { 
      id_lugares: 123,
      id_destino: 1,
      nombre: 'Test',
      categoria: 'Category',
      descripcion: 'Desc',
      horario: '9-18',
      totalResenas: 0,
      promedioRating: 0
    };
    expect(component.trackByLugar(0, lugar)).toBe(123);
  });

  it('should navigate to reviews when verResenas is called', () => {
    const navCtrl = TestBed.inject(NavController);
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00',
      totalResenas: 5,
      promedioRating: 4.5
    };

    component.verResenas(testLugar);

    expect(navCtrl.navigateForward).toHaveBeenCalledWith('/tabs/health', {
      queryParams: {
        id: 1,
        lugar: 'Test Place',
        categoria: 'Test Category'
      }
    });
  });

  it('should not navigate to reviews when lugar has no id', () => {
    const navCtrl = TestBed.inject(NavController);
    const testLugar = {
      id_destino: 1,
      nombre: 'Test Place',
      categoria: 'Test Category',
      descripcion: 'Test Description',
      horario: '9:00-18:00',
      totalResenas: 5,
      promedioRating: 4.5
    };

    component.verResenas(testLugar as any);

    expect(navCtrl.navigateForward).not.toHaveBeenCalled();
  });

  it('should validate edit form correctly', () => {
    const testLugar = {
      id_lugares: 1,
      id_destino: 1,
      nombre: 'Test',
      categoria: 'Category',
      descripcion: 'Desc',
      horario: '9-18',
      totalResenas: 3,
      promedioRating: 4.2
    };

    component.lugarEditando = { ...testLugar };
    expect(component['validarFormularioEdicion']()).toBeTrue();

    component.lugarEditando!.nombre = '';
    expect(component['validarFormularioEdicion']()).toBeFalse();

    component.lugarEditando!.nombre = 'Test';
    component.lugarEditando!.categoria = '';
    expect(component['validarFormularioEdicion']()).toBeFalse();
  });

  it('should get categoria icon correctly', () => {
    expect(component.getCategoriaIcon('Monumento')).toBe('business-outline');
    expect(component.getCategoriaIcon('Museo')).toBe('library-outline');
    expect(component.getCategoriaIcon('Unknown')).toBe('location-outline');
  });

  it('should get categoria class correctly', () => {
    expect(component.getCategoriaClass('Monumento')).toBe('monumento');
    expect(component.getCategoriaClass('Museo')).toBe('museo');
    expect(component.getCategoriaClass('Unknown')).toBe('otro');
  });

  it('should get categoria color correctly', () => {
    expect(component.getCategoriaColor('Monumento')).toBe('warning');
    expect(component.getCategoriaColor('Museo')).toBe('tertiary');
    expect(component.getCategoriaColor('Unknown')).toBe('medium');
  });
});