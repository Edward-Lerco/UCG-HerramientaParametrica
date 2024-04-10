import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { LocalService } from '../../services/local.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

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
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})

export class HomeComponent implements OnInit {
  @ViewChild('bottom') bottom!: ElementRef;

  user={
    nombre:'',
    apellidos:''
  };
  tokenUser:any;
  calculatorForm!: FormGroup
  mostrarDetalles: boolean = false;
  alert: boolean = false;
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
  requerido = false;
  rango: string = '';
  montoEnMoneda: string = '';
  reservaP: string = ''
  resultadoData: Item[] = [];
  
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

  tipo: any[] = [
    { label: 'Persona Física', tipoPersona: 'FÍSICA' },
    { label: 'Persona Moral', tipoPersona: 'MORAL' }
  ];

  constructor(
    private data:  DataService, 
    private local: LocalService,
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
  ){
    this.calculatorForm = this.formBuilder.group({
      tipoPersona: new FormControl('', Validators.required),
      razonSocial:        [null],
      nombreContacto:     [null],
      nombreProspecto:    [null],
      apellido1Prospecto: [null],
      apellido2Prospecto: [null],
      emailProspecto:     [null, [Validators.required, Validators.email]],
      telProspecto:       [null, Validators.required],
      direccionProspecto: [null, Validators.required],
      monto:              [null, Validators.required],

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

    this.calculatorForm.get('tipoPersona')!.valueChanges.subscribe(value => {
      if (value === 'MORAL') {
        this.calculatorForm.controls['nombreProspecto'].clearValidators();
        this.calculatorForm.controls['nombreProspecto'].reset();
        this.calculatorForm.controls['nombreProspecto'].updateValueAndValidity();
        this.calculatorForm.controls['apellido1Prospecto'].clearValidators();
        this.calculatorForm.controls['apellido1Prospecto'].reset();
        this.calculatorForm.controls['apellido1Prospecto'].updateValueAndValidity();
        this.calculatorForm.controls['apellido2Prospecto'].clearValidators();
        this.calculatorForm.controls['apellido2Prospecto'].reset();
        this.calculatorForm.controls['apellido2Prospecto'].updateValueAndValidity();

        this.calculatorForm.controls['razonSocial'].setValidators([Validators.required]);
        this.calculatorForm.controls['nombreContacto'].setValidators([Validators.required]);
      } else if (value === 'FÍSICA') {
        this.calculatorForm.controls['razonSocial'].clearValidators();
        this.calculatorForm.controls['razonSocial'].reset();
        this.calculatorForm.controls['razonSocial'].updateValueAndValidity();

        this.calculatorForm.controls['nombreContacto'].clearValidators();
        this.calculatorForm.controls['nombreContacto'].reset();
        this.calculatorForm.controls['nombreContacto'].updateValueAndValidity();

        this.calculatorForm.controls['nombreProspecto'].setValidators([Validators.required]);
        this.calculatorForm.controls['apellido1Prospecto'].setValidators([Validators.required]);
        this.calculatorForm.controls['apellido2Prospecto'].setValidators([Validators.required]);
      }
    });
  }

  uppercase(event: any, formControlName: string) {
    const control = this.calculatorForm.get(formControlName);
    if (control) {
      const inputValue = (event.target as HTMLInputElement)?.value;
      if (inputValue) {
        control.setValue(inputValue.toUpperCase());
      }
    }
  }

  ngOnInit() {
    const userData:any = localStorage.getItem('user');
    // console.log(userData);
    if (!userData) {
      this.router.navigate(['/login']);
    }else{
      try {
        const datos: any = JSON.parse(userData);
        this.tokenUser = datos['token'];  
        this.user = datos;
        this.local.isloader = false;
        // console.log(this.user);
        this.user.nombre = this.user.nombre.toUpperCase();
        this.user.apellidos = this.user.apellidos.toUpperCase();
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
        this.router.navigate(['/login']);
      }
    }
    
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
      { name: '0 créditos',               code: '0',           beta: '1.69',  puntaje: '40',  icon:'assets/icons/creditos.png'},
      { name: 'De 1 a 2 créditos',        code: '1',           beta: '-0.93', puntaje: '116', icon:'assets/icons/creditos.png'},
      { name: 'De 3 a 5 créditos',        code: '4',           beta: '1.83',  puntaje: '36',  icon:'assets/icons/creditos.png'},
      { name: 'Mayor a 5 créditos',       code: '6',           beta: '1.99',  puntaje: '32',  icon:'assets/icons/creditos.png'},
    ];
    this.indicador_e = [
      { name: 'No tiene atrasos',         code: '10',          beta: '-0.87', puntaje: '114', icon:'assets/icons/no-atraso.png'},
      { name: 'Hasta 30 días de atraso',  code: '20',          beta: '0',     puntaje: '89',  icon:'assets/icons/atraso.png'},
      { name: 'Más de 30 días de atraso', code: '30',          beta: '1.4',   puntaje: '48',  icon:'assets/icons/atraso.png'},
    ]
    this.calculatorForm.controls['indicador_f']?.valueChanges.subscribe((value: number) => {
      if (value < 5000000) {
        this.indicador_f = [{ name: value.toString(), code: '', beta: '0.25', puntaje: '82', icon: '' }];
      } else if (value >= 5000000 && value <= 25000000) {
        this.indicador_f = [{ name: value.toString(), code: '', beta: '0.74', puntaje: '68', icon: '' }];
      } else if (value > 25000000 && value <= 100000000) {
        this.indicador_f = [{ name: value.toString(), code: '', beta: '0', puntaje: '89', icon: '' }];
      } else if (value > 100000000) {
        this.indicador_f = [{ name: value.toString(), code: '', beta: '-2.26', puntaje: '154', icon: '' }];
      }
    });
    this.calculatorForm.controls['indicador_g']?.valueChanges.subscribe((value: number) => {
      if (value <= 12) {
        this.indicador_g = [{ name: value.toString(), code: '', beta: '0.56', puntaje: '73', icon: ''}]
      } else if ( value > 12 && value <= 36 ) {
        this.indicador_g = [{ name: value.toString(), code: '', beta: '0', puntaje: '89', icon: ''}]
      } else if ( value > 36 ) {
        this.indicador_g = [{ name: value.toString(), code: '', beta: '-0.07', puntaje: '91', icon: ''}]
      }
    });
    this.calculatorForm.controls['indicador_h']?.valueChanges.subscribe((value: number) => {
      if ( value <= 1 ) {
        this.indicador_h = [{ name: value.toString(), code: '', beta: '0.81', puntaje: '65', icon: ''}]
      } else if ( value > 1 ) {
        this.indicador_h = [{ name: value.toString(), code: '', beta: '0', puntaje: '89', icon: ''}]
      }
    });
    this.calculatorForm.controls['indicador_i']?.valueChanges.subscribe((value: number) => {
      if ( value <= 1 ) {
        this.indicador_i = [{ name: value.toString(), code: '', beta: '0.96', puntaje: '61', icon: ''}]
      } else if ( value > 1 && value <= 7 ) {
        this.indicador_i = [{ name: value.toString(), code: '', beta: '0.61', puntaje: '71', icon: ''}]
      } else if ( value > 7 ) {
        this.indicador_i = [{ name: value.toString(), code: '', beta: '0', puntaje: '89', icon: ''}]
      }
    });
    this.calculatorForm.controls['indicador_k']?.valueChanges.subscribe((value: number) => {
        this.indicador_k = [{ name: value.toString(), code: '', beta: '', puntaje: '', icon: ''}]
    });
    this.indicador_l = [
      { name: 'No Revolvente',            code: '10',         beta: '',      puntaje: '',    icon:'assets/icons/no-relevante.png'},
      { name: 'TDC y otros créditos revolventes', code: '20', beta: '',      puntaje: '',    icon:'assets/icons/tdc.png'},
      { name: 'Hipotecario y vivienda',   code: '30',         beta: '',      puntaje: '',    icon:'assets/icons/hipotecario.png'},
      { name: 'Comercial',                code: '40',         beta: '',      puntaje: '',    icon:'assets/icons/comercial.png'}
    ]
  }
  
  getValueSelect(controlName: string, property: string): string {
    const control = this.calculatorForm.get(controlName);
    return control && control.value ? control.value[property] : '';
  }
  
  getValueInput(indicador: string): { name: string, beta: string, puntaje: string } | undefined {
    let indicadorData;
    switch(indicador) {
      case 'indicador_f':
        indicadorData = this.indicador_f;
        break;
      case 'indicador_g':
        indicadorData = this.indicador_g;
        break;
      case 'indicador_h':
        indicadorData = this.indicador_h;
        break;
      case 'indicador_i':
        indicadorData = this.indicador_i;
        break;
      case 'indicador_k':
        indicadorData = this.indicador_k;
        break;
    }
    return indicadorData && indicadorData.length > 0 ? { name: indicadorData[0].name, beta: indicadorData[0].beta, puntaje: indicadorData[0].puntaje } : undefined;
  }

  sumarBetas() {
    if (this.respuestaData && this.respuestaData.resultado && this.respuestaData.resultado.items) {
      this.totalBeta = this.respuestaData.resultado.items.reduce((total, item) => total + item.beta, 0);
    } else {
      console.error('Error al sumar beta');
    }
  }

  // getBeta(indicador: string): number | undefined {
  //   const item = this.respuestaData.resultado.items.find(item => item.attribute === indicador);
  //   return item ? item.beta : undefined;
  // }
  
  // getPuntaje(indicador: string): number | undefined {
  //   const item = this.respuestaData.resultado.items.find(item => item.attribute === indicador);
  //   return item ? item.puntuaje : undefined;
  // }

  btnEvaluar() {
    this.requerido = true;
    if (this.calculatorForm.valid) {
      let body: DatosFormulario = {
        indicador_a: Number(this.calculatorForm.controls['indicador_a'].value['code']),
        indicador_b: Number(this.calculatorForm.controls['indicador_b'].value['code']),
        indicador_c: Number(this.calculatorForm.controls['indicador_c'].value['code']),
        indicador_d: Number(this.calculatorForm.controls['indicador_d'].value['code']),
        indicador_e: Number(this.calculatorForm.controls['indicador_e'].value['code']),
        indicador_f: this.calculatorForm.controls['indicador_f'].value,
        indicador_g: this.calculatorForm.controls['indicador_g'].value,
        indicador_h: this.calculatorForm.controls['indicador_h'].value,
        indicador_i: this.calculatorForm.controls['indicador_i'].value,
        indicador_k: this.calculatorForm.controls['indicador_k'].value,
        indicador_l: Number(this.calculatorForm.controls['indicador_l'].value['code'])
      };
      this.local.isloader = true;
      this.alert = false;
      this.mostrarDetalles = true;
      this.respuesta(body);
      console.log(this.calculatorForm);
    } else {
      this.alert = true;
      setTimeout(() => {
        this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        this.calificacion();
        this.sumarBetas();
        this.convertirIndicador;
        this.convertirMoneda1();
      }
    });
  }

  private calificacion() {
    const calificacion = this.respuestaData.resultado.totalizadores.calificacion;
    const reservas = this.respuestaData.resultado.totalizadores.reservaPerdida;
    const indicadorL = this.getValueSelect('indicador_l', 'code');

    let status: string = "";
    const rangos:any = {
      'A-1': {
          '10': { minMin: 0-(2*0.1), min: 0, max: 2.0, maxMax: 2.0+(2*0.1)},
          '20': { minMin: 0-(3*0.1), min: 0, max: 3.0, maxMax: 3.0+(3*0.1)},
          '30': { minMin: 0-(0.5*0.1), min: 0, max: 0.50, maxMax: 0.50+(0.5*0.1)},
          '40': { minMin: 0-(0.90*0.1), min: 0, max: 0.90, maxMax: 0.90+(0.90*0.1)}
      },
      'A-2': {
          '10': { minMin: 2.0-(1*0.1), min: 2.0, max: 3.0, maxMax: 3.0+(1*0.1)},
          '20': { minMin: 3.0-(2*0.1), min: 3.0, max: 5.0, maxMax: 5.0+(2*0.1)},
          '30': { minMin: 0.50-(0.25*0.1), min: 0.50, max: 0.75, maxMax: 0.75+(0.25*0.1)},
          '40': { minMin: 0.90-(0.6*0.1), min: 0.90, max: 1.5, maxMax: 1.5+(0.6*0.1)}
      },
      'B-1': {
        '10': { minMin: 3.0-(1*0.1), min: 3.0, max: 4.0, maxMax: 4.0+(1*0.1)},
        '20': { minMin: 5.0-(1.5*0.1), min: 5.0, max: 6.5, maxMax: 6.5+(1.5*0.1)},
        '30': { minMin: 0.75-(0.25*0.1), min: 0.75, max: 1.0, maxMax: 1.0+(0.25*0.1)},
        '40': { minMin: 1.5-(0.5*0.1), min: 1.5, max: 2.0, maxMax: 2.0+(0.5*0.1)}
      },
      'B-2': {
        '10': { minMin: 4.0-(1*0.1), min: 4.0, max: 5.0, maxMax: 5.0+(1*0.1)},
        '20': { minMin: 6.5-(1.5*0.1), min: 6.5, max: 8.0, maxMax: 8.0+(1.5*0.1)},
        '30': { minMin: 1.0-(0.5*0.1), min: 1.0, max: 1.5, maxMax: 1.5+(0.5*0.1)},
        '40': { minMin: 2.0-(0.5*0.1), min: 2.0, max: 2.5, maxMax: 2.5+(0.5*0.1)}
      },
      'B-3': {
        '10': { minMin: 5.0-(1*0.1), min: 5.0, max: 6.0, maxMax: 6.0+(1*0.1)},
        '20': { minMin: 8.0-(2*0.1), min: 8.0, max: 10.0, maxMax: 10.0+(2*0.1)},
        '30': { minMin: 1.5-(0.5*0.1), min: 1.5, max: 2.0, maxMax: 2.0+(0.5*0.1)},
        '40': { minMin: 2.5-(2.5*0.1), min: 2.5, max: 5.0, maxMax: 5.0+(2.5*0.1)}
      },
      'C-1': {
        '10': { minMin: 6.0-(2*0.1), min: 6.0, max: 8.0, maxMax: 8.0+(2*0.1)},
        '20': { minMin: 10.0-(5*0.1), min: 10.0, max: 15.0, maxMax: 15.0+(5*0.1)},
        '30': { minMin: 2.0-(3*0.1), min: 2.0, max: 5.0, maxMax: 5.0+(3*0.1)},
        '40': { minMin: 5.0-(5*0.1), min: 5.0, max: 10.0, maxMax: 10.0+(5*0.1)}
      },
      'C-2': {
        '10': { minMin: 8.0-(7*0.1), min: 8.0, max: 15.0, maxMax: 15.0+(7*0.1)},
        '20': { minMin: 15.0-(20*0.1), min: 15.0, max: 35.0, maxMax: 35.0+(20*0.1)},
        '30': { minMin: 5.0-(5*0.1), min: 5.0, max: 10.0, maxMax: 10.0+(5*0.1)},
        '40': { minMin: 10.0-(5.5*0.1), min: 10.0, max: 15.5, maxMax: 15.5+(5.5*0.1)}
      },
      'D': {
        '10': { minMin: 15.0-(20*0.1), min: 15.0, max: 35.0, maxMax: 35.0+(20*0.1)},
        '20': { minMin: 35.0-(40*0.1), min: 35.0, max: 75.0, maxMax: 75.0+(40*0.1)},
        '30': { minMin: 10.0-(30*0.1), min: 10.0, max: 40.0, maxMax: 40.0+(30*0.1)},
        '40': { minMin: 15.5-(29.5*0.1), min: 15.5, max: 45.0, maxMax: 45.0+(29.5*0.1)}
      },
      'E': {
        '10': { minMin: 35.0+(35*0.1), min: 35.0},
        '20': { minMin: 75.0+(75*0.1), min: 75.0},
        '30': { minMin: 40.0+(40*0.1), min: 40.0},
        '40': { minMin: 45.0+(45*0.1), min: 45.5}
      },
    };
    if (calificacion in rangos && indicadorL in rangos[calificacion]) {
      const rango = rangos[calificacion][indicadorL];
      if (rango.minMin < reservas && reservas <= rango.min) {
        status = '¡Evaluar!';
      } else if (rango.min < reservas && reservas <= rango.max){
        status = '¡Aprobado!'
      } else if (rango.max < reservas && reservas <= rango.maxMax){
        status = '¡Evaluar!'
      } else{
        status = '¡Rechazado!'
      }
    }
    this.rango = status;
  }

  ocultarCard() {
    // this.calculatorForm.reset();
    // this.mostrarDetalles = false;
    // this.alert = false;
    // this.requerido = false;
    // this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    location.reload();
  }

  showTabla() {
    this.visible = true;
  }

  convertirIndicador(indicador: string): string | undefined {
    const valor = this.getValueInput(indicador)?.name;
    if (valor) {
      const numero = parseFloat(valor);
      return numero.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }
    return undefined;
  }

  convertirPorcentaje(indicador: string): string | undefined {
    const valor = this.getValueInput(indicador)?.name;
    if (valor) {
      const numero = parseFloat(valor);
      const porcentaje = numero / 100;
      return porcentaje.toLocaleString('es-MX', { style: 'percent', maximumFractionDigits: 2 });
    }
    return undefined;
  }

  convertirMoneda1(){
    const monto = this.calculatorForm.value.monto;
    const reserva = this.calculatorForm.get('monto')?.value*(this.respuestaData.resultado.totalizadores.reservaPerdida*0.01)
    this.montoEnMoneda = monto.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
    this.reservaP = reserva.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
  }

  getStyleForRango(rango: string): string {
    switch (rango) {
      case '¡Aprobado!':
        return 'verde';
      case '¡Evaluar!':
        return 'amarillo';
      case '¡Rechazado!':
        return 'rojo';
      default:
        return '';
    }
  }

  cerrarSesion(){
    // localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  enviarPDF(pdfDocGenerator: string){
    let body = {token: this.tokenUser, file_base64: pdfDocGenerator};
    this.local.isloader = true;
    this.data.pdf(body).subscribe({next: (respuesta) => {
      console.log(respuesta);
      this.local.isloader = false;
      this.messageService.add({ severity: 'success', summary: 'Se envio correctamente el documento'});
    }})
  }
  
  generadorPDF(generar: number ){
    this.requerido = true;
    if (this.calculatorForm.valid){
      var fechaActual = new Date().toLocaleString();
      const totalBetaFormatted = this.totalBeta.toFixed(2);
      const probabilidadIncumplimiento = this.respuestaData.resultado.totalizadores.probabilidadIncumplimiento;
      const probabilidadEnPorcentaje = (probabilidadIncumplimiento).toFixed(2) + '%';
      const reservaPerdida = this.respuestaData.resultado.totalizadores.reservaPerdida;
      const reservaPorcentaje = (reservaPerdida).toFixed(2) + '%';
      
      let pdf:any = {
        pageSize: 'LETTER',
        header: [
          {
          // Logo en la parte superior derecha
              alignment: 'right',
              margin: [0, 20, 20, 0], // [left, top, right, bottom]
              image: 'data:image/png;base64,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',
              width: 100
          }
        ],
        content: [
          { text: 'Fecha: ' + fechaActual, alignment: 'left', fontSize: 10 },
          { text: '\n', margin: [0, 20, 0, 0] },
          { text: 'Calculadora de Probabilidad de Incumplimiento\n', fontSize: 20, color: '#402b57', alignment: 'center' },
          { text: '\n', margin: [0, 10, 0, 0] },
  
          {
            table:{
              style: 'table',
              headerRows: 1,
              body:[
                [{ text: 'Ejecutivo de credito', style: 'tableHeader2', colSpan: 3 },'','',''],
                ['Nombre:','', {text: this.user.nombre}, {text: this.user.apellidos}]
              ]
            },
            layout: 'noBorders'
          },
  
          { text: '\n'},
  
  
          {
            table:{
              style: 'table',
              headerRows: 1,
              body:[
                [{ text: 'Prospecto', style: 'tableHeader2', colSpan: 2} ,''],
                ['Tipo de persona: ', { text: this.calculatorForm.get('tipoPersona')?.value}],
              ]
            },
            layout: 'noBorders'
          },
          {
            table:{
              style: 'table',
              headerRows: 1,
              body:[
                ['Nombre:', '', {text: this.calculatorForm.get('nombreProspecto')?.value||this.calculatorForm.get('razonSocial')?.value}, {text: this.calculatorForm.get('apellido1Prospecto')?.value || this.calculatorForm.get('nombreContacto')?.value}, {text: this.calculatorForm.get('apellido2Prospecto')?.value}],
              ]
            },
            layout: 'noBorders'
          },
          {
            table:{
              style: 'table',
              headerRows: 1,
              body:[
                ['Teléfono:', { text: this.calculatorForm.get('telProspecto')?.value}],
                ['Email:', { text: this.calculatorForm.get('emailProspecto')?.value}],
                ['Dirección:', { text: this.calculatorForm.get('direccionProspecto')?.value}],
              ]
            },
            layout: 'noBorders'
          },
          { text: '\n'},
          
          {
            table: {
              style: 'table',
              widths: ['auto', 'auto', 65, 'auto'],
              headerRows: 1,
              body: [
                [{text: 'Variable', style: 'tableHeader'}, {text: 'Atributo', style: 'tableHeader'}, {text: 'Beta', style: 'tableHeader'}, {text: 'Puntaje', style: 'tableHeader'}],
                ['1. Indique la industria del crédito',                       {text: this.getValueSelect('indicador_a', 'name'), alignment: 'center'},  {text: this.getValueSelect('indicador_a', 'beta'), alignment: 'center'}, {text: this.getValueSelect('indicador_a', 'puntaje'), alignment: 'center'}],
                ['2. ¿Es actividad vulnerable?',                              {text: this.getValueSelect('indicador_b', 'name'), alignment: 'center'},  {text: this.getValueSelect('indicador_b', 'beta'), alignment: 'center'}, {text: this.getValueSelect('indicador_b', 'puntaje'), alignment: 'center'}],
                ['3. Municipio del crédito',                                  {text: this.getValueSelect('indicador_c', 'name'), alignment: 'center'},  {text: this.getValueSelect('indicador_c', 'beta'), alignment: 'center'}, {text: this.getValueSelect('indicador_c', 'puntaje'), alignment: 'center'}],
                ['4. Total de créditos con los que cuenta el intermediario',  {text: this.getValueSelect('indicador_d', 'name'), alignment: 'center'},  {text: this.getValueSelect('indicador_d', 'beta'), alignment: 'center'}, {text: this.getValueSelect('indicador_d', 'puntaje'), alignment: 'center'}],
                ['5. Días de atraso que presenta en buró el acreditado',      {text: this.getValueSelect('indicador_e', 'name'), alignment: 'center'},  {text: this.getValueSelect('indicador_e', 'beta'), alignment: 'center'}, {text: this.getValueSelect('indicador_e', 'puntaje'), alignment: 'center'}],
                ['6. Monto de ventas',                                        {text: this.convertirIndicador('indicador_f'), alignment: 'center'},  {text: this.getValueInput('indicador_f')?.beta, alignment: 'center'}, {text: this.getValueInput('indicador_f')?.puntaje, alignment: 'center'}],
                ['7. Antigüedad de la empresa (en meses)',                    {text: this.getValueInput('indicador_g')?.name, alignment: 'center'},  {text: this.getValueInput('indicador_g')?.beta, alignment: 'center'}, {text: this.getValueInput('indicador_g')?.puntaje, alignment: 'center'}],
                ['8. Margen Financiero',                                      {text: this.convertirPorcentaje('indicador_h'), alignment: 'center'},  {text: this.getValueInput('indicador_h')?.beta, alignment: 'center'}, {text: this.getValueInput('indicador_h')?.puntaje, alignment: 'center'}],
                ['9. ROA',                                                    {text: this.convertirPorcentaje('indicador_i'), alignment: 'center'},  {text:this.getValueInput('indicador_i')?.beta, alignment: 'center'}, {text: this.getValueInput('indicador_i')?.puntaje, alignment: 'center'}],
                [{text: 'Total', alignment: 'center', bold: true}, '',        {text: totalBetaFormatted, alignment: 'center', bold: true},           {text: this.respuestaData.resultado.totalizadores.puntuaje, alignment: 'center', bold: true}],
              ]
            },
            layout:{
              fillColor: function (rowIndex:any,) {return (rowIndex % 2 === 1) ? '#3bbac5' : null;},
              hLineWidth: function () {return 0;},
              vLineWidth: function () {return 0;},
            }
          },
  
          { text: '\n' },
  
          {
            alignment: 'center',
            columns: [
              {
                table: {
                  style: 'table',
                  headerRows: 1,
                  body: [
                    [{text: 'Resultado de la evaluación', style: 'tableHeader', colSpan: 2},''],
                    [{text: 'Monto de crédito solicitado'},    { text: this.montoEnMoneda, alignment: 'center', bold: true }],
                    [{text: 'Probabilidad de Incumplimiento'}, { text: probabilidadEnPorcentaje, alignment: 'center', bold: true }],
                    [{text: 'Puntaje'},                        { text: this.respuestaData.resultado.totalizadores.puntuaje, alignment: 'center', bold: true }],
                    [{text: 'Severidad de la Pérdida'},        { text: this.convertirPorcentaje('indicador_k'), alignment: 'center', bold: true }],
                    [{text: '% Reservas'},                     { text: reservaPorcentaje, alignment: 'center', bold: true }],
                    [{text: 'Reserva preventiva'},             { text: this.reservaP, alignment: 'center', bold: true }],
                    [{text: 'Tipo de crédito'},                { text: this.getValueSelect('indicador_l', 'name'), alignment: 'center', bold: true }],
                    [{text: 'Calificación'},                   { text: this.respuestaData.resultado.totalizadores.calificacion, alignment: 'center', bold: true }]
                  ]
                },
                layout:{
                  fillColor: function (rowIndex:any,) {return (rowIndex % 2 === 1) ? '#3bbac5' : null;},
                  hLineWidth: function () {return 0;},
                  vLineWidth: function () {return 0;},
                }
              },
              {
                // text: this.rango,
                // style: this.getStyleForRango(this.rango)
              }
            ]
          }
  
        ],
        footer:[
          { text: '43 poniente No. 718 Col. Gabriel Pastor CP 72420 Puebla, Pue.\n', color: '#402b57', alignment: 'center', fontSize: 10},
          {
            style:'footer',
            columns: [
              { text: 'Tel(222)141 10 31', alignment: 'center' },
              { text: 'ucg.com.mx', alignment: 'center' }
            ]
          }
        ],
        styles: {
          table: {
            margin: [0, 0, 0, 0],
            fontSize: 12,
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black',
            alignment: 'center'
          },
          tableHeader2: {
            bold: true,
            fontSize: 13,
            color: 'black',
            alignment: 'left'
          },
          verde: {
            margin: [0, 50, 0, 0],
            color: 'green',
            fontSize: 20,
            bold: true
          },
          amarillo: {
            margin: [0, 50, 0, 0],
            color: 'yellow',
            fontSize: 20,
            bold: true
          },
          rojo: {
            margin: [0, 50, 0, 0],
            color: 'red',
            fontSize: 20,
            bold: true
          },
          footer:{
            fontSize: 10,
            color: '#402b57',
            bold: true
          }
        },
      };
      if(generar == 10){
        pdfMake.createPdf(pdf).open();
      }else{
        let pdfDocGenerator = pdfMake.createPdf(pdf);
        pdfDocGenerator.getBase64((data) => {
          this.enviarPDF(data);
        });
      }
    }else {
      this.alert = true;
      setTimeout(() => {
        this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.delayTime});
    }
  }
}