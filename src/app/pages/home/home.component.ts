import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { LocalService } from '../../services/local.service';


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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('bottom') bottom!: ElementRef;

  constructor(private data: DataService,
    private local: LocalService){}

  datosFormulario: DatosFormulario = {
    indicador_a: null,
    indicador_b: null,
    indicador_c: null,
    indicador_d: null,
    indicador_e: null,
    indicador_f: null,
    indicador_g: null,
    indicador_h: null,
    indicador_i: null,
    indicador_k: null,
    indicador_l: null
  };
  mostrarDetalles: boolean = false;
  alert: boolean = false;
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

  camposInvalidos: Set<string> = new Set<string>();

  delayTime = 100;

  btnEvaluar() {
    if (this.validarCampos()) {
      this.local.isloader = true;
      this.mostrarDetalles = true;
      this.respuesta();
      this.alert = false;
    } else {
      this.alert = true;
      setTimeout(() => {
        this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, this.delayTime);
    }
  }

  private respuesta(){
    this.data.getData(this.datosFormulario).subscribe({next:(rsp)=>{
      this.local.isloader = false;
      this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      console.log(rsp);
      this.respuestaData = rsp;
    }});
  }

  private validarCampos(): boolean {
    return (
      this.datosFormulario.indicador_a !== null &&
      this.datosFormulario.indicador_b !== null &&
      this.datosFormulario.indicador_c !== null &&
      this.datosFormulario.indicador_d !== null &&
      this.datosFormulario.indicador_e !== null &&
      this.datosFormulario.indicador_f !== null &&
      this.datosFormulario.indicador_g !== null &&
      this.datosFormulario.indicador_h !== null &&
      this.datosFormulario.indicador_i !== null &&
      this.datosFormulario.indicador_k !== null &&
      this.datosFormulario.indicador_l !== null &&
      !this.camposInvalidos.size
    );
  }

  ocultarCard() {
    this.mostrarDetalles = false;
    this.datosFormulario = {
      indicador_a: null,
      indicador_b: null,
      indicador_c: null,
      indicador_d: null,
      indicador_e: null,
      indicador_f: null,
      indicador_g: null,
      indicador_h: null,
      indicador_i: null,
      indicador_k: null,
      indicador_l: null
    };
    this.camposInvalidos.clear();
  }

  getVariableName(attribute: string): string {
    const variableNames: { [key: string]: string } = {
      'indicador_a': 'Indique la industria del crédito',
      'indicador_b': '¿Es actividad vulnerable?',
      'indicador_c': 'Municipio del crédito',
      'indicador_d': 'Días de atraso que presenta en buró el acreditado',
      'indicador_e': 'Monto de ventas',
      'indicador_f': 'Antigüedad de la empresa',
      'indicador_g': 'Margen Financiero',
      'indicador_h': 'ROA',
      'indicador_i': 'Tipo de crédito',
    };
  
    if (variableNames.hasOwnProperty(attribute)) {
      return variableNames[attribute];
    } else {
      return attribute;
    }
  }

  sumaBeta(): number {
    return this.respuestaData.resultado.items.reduce((acc, item) => acc + item.beta, 0);
  }

  sumaPuntuaje(): number {
    return this.respuestaData.resultado.items.reduce((acc, item) => acc + item.puntuaje, 0);
  }
}
