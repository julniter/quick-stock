import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '', component: LoginComponent },
];


@NgModule({
  imports: [
      RouterModule.forChild(routes)
  ],
  exports: [
      RouterModule
  ],
  declarations: []
})
export class AuthRoutingModule { }
