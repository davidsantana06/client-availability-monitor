import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MonitorConfigComponent } from './components/monitor-config/monitor-config.component';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { ServersPoolComponent } from './components/servers-pool/servers-pool.component';
import { MonitorListComponent } from './components/monitor-list/monitor-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MonitorConfigComponent,
    UsersInfoComponent,
    ServersPoolComponent,
    MonitorListComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
