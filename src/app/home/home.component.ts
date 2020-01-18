import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  crumbs = '';
  parentLink = '';
  displayArrow = false;
  default = 'Quick Stock';

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit() {
    this.setBreadCrumbs(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setBreadCrumbs(event.url);
      });
  }

  setBreadCrumbs(rawUrl: string) {
    this.crumbs = rawUrl.length
      ? rawUrl
          .substring(1)
          .split('/')
          .map(t => decodeURIComponent(new TitleCasePipe().transform(t.trim())))
          .join(' / ')
      : this.default;
    this.displayArrow = this.crumbs.indexOf('/') !== -1;
    if (this.displayArrow) {
      this.parentLink = '/' + this.crumbs.split(' / ')[0].toLowerCase();
    }
  }
}
