import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AlertComponent } from '@app/components/alert/alert.component';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { HomeComponent } from '@app/components/home/home.component';
import { LayoutComponent } from '@app/components/layout/layout.component';
import { MonitorConfigComponent } from '@app/components/monitor-config/monitor-config.component';
import { MonitorListComponent } from '@app/components/monitor-list/monitor-list.component';
import { NavbarComponent } from '@app/components/navbar/navbar.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { ServersPoolComponent } from '@app/components/servers-pool/servers-pool.component';
import { UsersInfoComponent } from '@app/components/users-info/users-info.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';

import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';

@NgModule({
  declarations: [
    AppComponent,

    LayoutComponent,
    NavbarComponent,
    HomeComponent,

    MonitorConfigComponent,
    UsersInfoComponent,
    ServersPoolComponent,
    MonitorListComponent,

    PageHeaderComponent,
    ConfirmDialogComponent,
    AlertComponent,

    TooltipDirective,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
