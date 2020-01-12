import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';



@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    LayoutModule,
    BrowserAnimationsModule
  ],
  exports: [
    BrowserModule,
    CommonModule,
    LayoutModule,
    BrowserAnimationsModule
  ]
})
export class CoreModule { }
