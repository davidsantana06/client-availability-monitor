import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MonitorConfigComponent } from './components/monitor-config/monitor-config.component';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { ServersPoolComponent } from './components/servers-pool/servers-pool.component';
import { MonitorListComponent } from './components/monitor-list/monitor-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'monitor-config', pathMatch: 'full' },
  { path: 'monitor-config', component: MonitorConfigComponent },
  { path: 'users-info', component: UsersInfoComponent },
  { path: 'servers-pool', component: ServersPoolComponent },
  { path: 'monitor-list', component: MonitorListComponent },
  { path: '**', redirectTo: 'monitor-config' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
