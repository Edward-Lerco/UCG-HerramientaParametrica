import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { LocalService } from '../../services/local.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export interface DatosFormulario { 
  indicador_a: number | null;
  indicador_b: number | null;
  indicador_c: number | null;
  indicador_d: number | null;
  indicador_e: number | null;
  indicador_f: number | null;
  indicador_g: number | null;
  indicador_h: number | null;
  indicador_i: number | null;
  indicador_k: number | null;
  indicador_l: number | null;
}

export interface Respuesta {
  code:      number;
  name:      string;
  resultado: Resultado;
  type:      string;
}

export interface Resultado {
  items:         Item[];
  totalizadores: Totalizadores;
}

export interface Item {
  attribute: string;
  beta:      number;
  puntuaje:  number;
}

export interface Totalizadores {
  probabilidadIncumplimiento: number;
  puntuaje:                   number;
  reservaPerdida:             number;
  porcentajePerdida:          number;
  calificacion:               string;
}

interface indicadores {
  name:    string;
  code:    string;
  beta:    string;
  puntaje: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('bottom') bottom!: ElementRef;

  calculatorForm!: FormGroup
  mostrarDetalles: boolean = false;
  alert: boolean = false;
  camposInvalidos: Set<string> = new Set<string>();
  delayTime = 100;
  visible?: boolean;
  indicador_a!: indicadores[];
  indicador_b!: indicadores[]; 
  indicador_c!: indicadores[]; 
  indicador_d!: indicadores[]; 
  indicador_e!: indicadores[]; 
  indicador_f!: indicadores[]; 
  indicador_g!: indicadores[]; 
  indicador_h!: indicadores[]; 
  indicador_i!: indicadores[]; 
  indicador_k!: indicadores[]; 
  indicador_l!: indicadores[];
  totalBeta: number = 0;
  totalPuntaje: number = 0;


  respuestaData: Respuesta = {
    code: 0,
    name: '',
    resultado: {items: [], totalizadores: {
      probabilidadIncumplimiento: 0,
      puntuaje: 0,
      reservaPerdida: 0,
      porcentajePerdida: 0,
      calificacion: ''
    }},
    type: ''
 }


  constructor(
    private data:  DataService, 
    private local: LocalService,
    private fb:    FormBuilder
  ){
    this.calculatorForm = this.fb.group({
      indicador_a: [null, Validators.required],
      indicador_b: [null, Validators.required],
      indicador_c: [null, Validators.required],
      indicador_d: [null, Validators.required],
      indicador_e: [null, Validators.required],
      indicador_f: [null, Validators.required],
      indicador_g: [null, Validators.required],
      indicador_h: [null, Validators.required],
      indicador_i: [null, Validators.required],
      indicador_k: [null, Validators.required],
      indicador_l: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.indicador_a = [
      { name: 'Construcción',             code: '10',          beta: '1.85',  puntaje: '36',  icon:'assets/icons/construccion.png'},
      { name: 'Textil',                   code: '20',          beta: '-0.56', puntaje: '105', icon:'assets/icons/textil.png'},
      { name: 'Comercio',                 code: '30',          beta: '0.11',  puntaje: '86',  icon:'assets/icons/comercio.png'},
      { name: 'Agropecuario',             code: '40',          beta: '-0.68', puntaje: '108', icon:'assets/icons/agropecuario.png'},
      { name: 'Servicios',                code: '50',          beta: '0.17',  puntaje: '84',  icon:'assets/icons/servicios.png'},
      { name: 'Industria',                code: '60',          beta: '0',     puntaje: '89',  icon:'assets/icons/industria.png'},
      { name: 'Otro',                     code: '70',          beta: '0',     puntaje: '89',  icon:'assets/icons/otro.png'}
    ];
    this.indicador_b = [
      { name: 'Sí',                       code: '10',          beta: '0.78',  puntaje: '66',  icon:'assets/icons/si.png'},
      { name: 'No',                       code: '20',          beta: '0',     puntaje: '89',  icon:'assets/icons/no.png'}
    ]
    this.indicador_c = [
      { name: 'Puebla',                   code: '10',          beta: '0.12',  puntaje:'86',   icon:'assets/icons/puebla.png'},
      { name: 'Querétaro',                code: '20',          beta: '0',     puntaje:'89',   icon:'assets/icons/Queretaro.png'},
      { name: 'San Andrés Cholula',       code: '30',          beta: '-0.81', puntaje:'112',  icon:'assets/icons/iglesia.png'},
      { name: 'San Pedro Cholula',        code: '40',          beta: '-1.48', puntaje:'132',  icon:'assets/icons/iglesia.png'},
      { name: 'Otro',                     code: '50',          beta: '1.36',  puntaje:'50' ,  icon:'assets/icons/otro-muni.png'}
    ]

    this.indicador_d = [
      { name: '0 créditos',                        code: '0',           beta: '1.69',  puntaje: '40',  icon:'assets/icons/creditos.png'},
      { name: 'De 1 a 2 créditos', code: '1',   beta: '-0.93', puntaje: '116', icon:'assets/icons/creditos.png'},
      { name: 'De 3 a 5 créditos', code: '3',   beta: '1.83',  puntaje: '36',  icon:'assets/icons/creditos.png'},
      { name: 'Mayor a 5 créditos',                code: '5',           beta: '1.99',  puntaje: '32',  icon:'assets/icons/creditos.png'},
    ];
    this.indicador_e = [
      { name: 'No tiene atrasos',         code: '10',          beta: '-0.87', puntaje: '114', icon:'assets/icons/no-atraso.png'},
      { name: 'Hasta 30 días de atraso',  code: '20',          beta: '0',     puntaje: '89',  icon:'assets/icons/atraso.png'},
      { name: 'Más de 30 días de atraso', code: '30',          beta: '1.4',   puntaje: '48',  icon:'assets/icons/atraso.png'},
    ]
    this.indicador_f = [
      { name: 'Menor a $5,000,000',       code: '4900000',     beta: '0.25',  puntaje: '82',  icon:'assets/icons/monto1.png'},
      { name: 'De $5,000,000 a $25,000,000',  code: '24000000', beta: '0.74', puntaje: '68', icon:'assets/icons/monto2.png'},
      { name: 'De $26,000,000 a $100,000,000',        code: '50000000', beta: '0',    puntaje: '89', icon:'assets/icons/monto3.png'},
      { name: 'Mayor a $100,000,000',      code: '110000000',  beta: '-2.26', puntaje: '154', icon:'assets/icons/monto4.png'},
    ]
    this.indicador_g = [
      { name: 'De 0 a 12 meses',  code: '11',         beta: '0.56',  puntaje: '73',  icon:'assets/icons/antiguedad1.png'},
      { name: 'De 13 a 36 meses',               code: '30',       beta: '0',    puntaje: '89', icon:'assets/icons/antiguedad1.png'},
      { name: 'Mayor a 36 meses',          code: '37',         beta: '-0.07', puntaje: '91',  icon:'assets/icons/antiguedad1.png'},
    ]
    this.indicador_h = [
      { name: 'Menor o igual a 1%',        code: '0',          beta: '0.81',  puntaje: '65',  icon:'assets/icons/menor-igual.png'},
      { name: 'Mayor a 1%',                code: '2',          beta: '0',     puntaje: '89',  icon:'assets/icons/mayor.png'},
    ]
    this.indicador_i = [
      { name: 'Del 0% al 1%',        code: '0',          beta: '0.96',  puntaje: '61',  icon:'assets/icons/menor-igual.png'},
      { name: 'Del 1.1% al 7%', code: '4', beta: '0.61',  puntaje: '71',  icon:'assets/icons/mayor-igual.png'},
      { name: 'Mayor al 7%',                code: '8',          beta: '0',     puntaje: '89',  icon:'assets/icons/mayor.png'},
    ]
    this.indicador_k = [
      { name: '10%',                       code: '10' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '20%',                       code: '20' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '30%',                       code: '30' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '40%',                       code: '40' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '50%',                       code: '50' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '60%',                       code: '60' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '70%',                       code: '70' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '80%',                       code: '80' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '90%',                       code: '90' ,        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
      { name: '100%',                      code: '100',        beta: '',      puntaje: '',    icon:'assets/icons/perdida.png'},
    ]
    this.indicador_l = [
      { name: 'No Revolvente',             code: '10',         beta: '',      puntaje: '',    icon:'assets/icons/no-relevante.png'},
      { name: 'TDC y otros créditos revolventes', code: '20',  beta: '',      puntaje: '',    icon:'assets/icons/tdc.png'},
      { name: 'Hipotecario y vivienda',    code: '30',         beta: '',      puntaje: '',    icon:'assets/icons/hipotecario.png'},
      { name: 'Comercial',                 code: '40',         beta: '',      puntaje: '',    icon:'assets/icons/comercial.png'}
    ]

  }

  // getIndicadorValue(controlName: string): string {
  //   const control = this.calculatorForm.get(controlName);
  //   return control && control.value ? control.value['name'] : '';
  // }

  getIndicadorBeta(controlName: string): string {
    const control = this.calculatorForm.get(controlName);
    return control && control.value ? control.value['beta'] : '';
  }

  getIndicadorPuntaje(controlName: string): string {
    const control = this.calculatorForm.get(controlName);
    return control && control.value ? control.value['puntaje'] : '';
  }

  btnEvaluar() {
    if (this.calculatorForm.valid) {
      let body: DatosFormulario = {
        indicador_a: Number(this.calculatorForm.controls['indicador_a'].value['code']),
        indicador_b: Number(this.calculatorForm.controls['indicador_b'].value['code']),
        indicador_c: Number(this.calculatorForm.controls['indicador_c'].value['code']),
        indicador_d: Number(this.calculatorForm.controls['indicador_d'].value['code']),
        indicador_e: Number(this.calculatorForm.controls['indicador_e'].value['code']),
        indicador_f: Number(this.calculatorForm.controls['indicador_f'].value['code']),
        indicador_g: Number(this.calculatorForm.controls['indicador_g'].value['code']),
        indicador_h: Number(this.calculatorForm.controls['indicador_h'].value['code']),
        indicador_i: Number(this.calculatorForm.controls['indicador_i'].value['code']),
        indicador_k: Number(this.calculatorForm.controls['indicador_k'].value['code']),
        indicador_l: Number(this.calculatorForm.controls['indicador_l'].value['code'])
      };
      this.local.isloader = true;
      this.alert = false;
      this.mostrarDetalles = true;
      this.respuesta(body);      

      this.totalBeta = 0;
      this.totalPuntaje = 0;
      for (const controlName in this.calculatorForm.controls) {
        if (this.calculatorForm.controls.hasOwnProperty(controlName)) {
          const control = this.calculatorForm.controls[controlName];
          const beta = Number(control.value['beta']);
          const puntaje = Number(control.value['puntaje']);
          if (!isNaN(beta)) this.totalBeta += beta;
          if (!isNaN(puntaje)) this.totalPuntaje += puntaje;
        }
      }
    } else {
      this.alert = true;
      setTimeout(() => {
        this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      this.delayTime});
    }
  }


  private respuesta(body: DatosFormulario){
    this.data.getData(body).subscribe({
      next: (rsp) => {
        this.local.isloader = false;
        this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        console.log(rsp);
        this.respuestaData = rsp;
      }
    });
  }

  reservas(){
    
  }

  ocultarCard() {
    this.mostrarDetalles = false;
    this.calculatorForm.reset();
    this.camposInvalidos.clear();
  }

  showDialog() {
    this.visible = true;
  }
  
}
