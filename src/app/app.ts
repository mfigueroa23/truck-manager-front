import { Component } from '@angular/core';
import { LayoutComponent } from './shared/organisms/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  template: `<app-layout />`
})
export class App {}
