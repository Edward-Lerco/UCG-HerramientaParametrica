import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MessageService } from 'primeng/api';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent {

  loginForm!: FormGroup;
  requerido = false;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private local: LocalService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    this.requerido = true
    if (this.loginForm.valid) {
      this.local.isloader = true;
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;
      this.authService.login(username, password).subscribe(
        (response) => {
          this.loginResponse(response);
        },
        (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Usuario y/o Contraseña Incorrecta'});
        }
      );
    }
  }

  private loginResponse(response: any){
    localStorage.setItem('user', JSON.stringify(response.data));
    this.router.navigate(['/home']);
  }

}
