import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MonitorConfigComponent } from './components/monitor-config/monitor-config.component';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { ServersPoolComponent } from './components/servers-pool/servers-pool.component';
import { MonitorListComponent } from './components/monitor-list/monitor-list.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { AlertComponent } from './components/alert/alert.component';
import { TooltipDirective } from './directives/tooltip.directive';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    NavbarComponent,
    MonitorConfigComponent,
    UsersInfoComponent,
    ServersPoolComponent,
    MonitorListComponent,
    PageHeaderComponent,
    AlertComponent,
    TooltipDirective,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
