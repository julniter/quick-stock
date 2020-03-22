import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { PermissionsService } from 'src/app/core/permissions/permissions.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = '';
  isLoggedIn = false;
  loginForm: FormGroup = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private afAuthService: AngularFireAuth,
    private spinner: SpinnerService,
    private permissionService: PermissionsService
  ) { }

  ngOnInit() {
    this.afAuthService.authState.subscribe((authState) => {
      if (authState !== null) {
        this.spinner.show();
        this.permissionService.rolesPrmomise.finally(() => {
          this.router.navigate(['./dashboard']);
          this.isLoggedIn = true;
          this.spinner.hide();
        });
      }
    });
  }

  onSubmit() {
    if (!this.loginForm.valid) { return; }

    const loginForm = this.loginForm.getRawValue();

    this.spinner.show();
    this.afAuthService.auth
    .signInWithEmailAndPassword(loginForm.username, loginForm.password)
    .catch(err => {
      this.errorMessage = err;
    }).finally(() => {
      this.spinner.hide();
    });
  }
}
