import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { SpinnerService } from './shared/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'quick-stock';
  isAuthenticated = false;

  constructor(private afAuth: AngularFireAuth, private spinner: SpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.afAuth.user.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
      this.spinner.hide();

      this.isAuthenticated = true;
    });
  }
}
