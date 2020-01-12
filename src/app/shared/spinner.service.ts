import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Spinner } from 'ngx-spinner/lib/ngx-spinner.enum';

export const pageSpinner = 'fullPage';

export const spinnerConfig  = {
  size: 'medium',
  color: '#3f51b5',
  type: 'ball-spin',
  bdColor: 'rgba(255,255,255,0.3)',
  fullScreen: true
};

export const spinnerContainerConfig  = {
  size: 'medium',
  color: '#3f51b5',
  type: 'ball-spin',
  bdColor: 'rgba(255,255,255,0.3)',
  fullScreen: false
};


@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(private spinner: NgxSpinnerService) { }

  show(name = pageSpinner) {
    if (name !== pageSpinner) {
      this.spinner.show(name, spinnerContainerConfig as Spinner);
    } else {
      this.spinner.show(name, spinnerConfig as Spinner);
    }
  }

  hide(name = pageSpinner) {
    this.spinner.hide(name);
  }
}
