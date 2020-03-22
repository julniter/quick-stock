import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { SpinnerService } from 'src/app/shared/spinner.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  errorMessage = '';
  loginForm: FormGroup = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private afAuthService: AngularFireAuth,
    private spinner: SpinnerService
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.afAuthService.auth.signOut().finally(() => {
      this.router.navigate(['./authentication']).finally(() => {this.spinner.hide();});
    });
  }
}
