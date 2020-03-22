import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { LogoutComponent } from './logout/logout.component';



@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent, LogoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [LoginComponent, LogoutComponent, ForgotPasswordComponent]
})
export class AuthModule { }
