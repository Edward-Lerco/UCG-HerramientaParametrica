import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginform!: FormGroup;
  username!: string;
  password!: string;

  constructor(private formBuilder: FormBuilder) {
    this.loginform = this.formBuilder.group({
      email: [''],
      password: ['']
    });
  }

  onLogin(){
    
  }

}
