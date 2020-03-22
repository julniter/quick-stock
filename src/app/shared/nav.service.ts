import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { last } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  default = 'Quick Stock';
  selected = '';

  constructor(private route: ActivatedRoute) {

    route.url.subscribe((url) => {
      const urlSegment = url[url.length - 1];
      this.selected = urlSegment.path.length ? urlSegment.path : this.default;
    });

  }

}
