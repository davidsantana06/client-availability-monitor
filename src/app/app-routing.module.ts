import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LayoutComponent } from './components/layout/layout.component';
import { MonitorConfigComponent } from './components/monitor-config/monitor-config.component';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { ServersPoolComponent } from './components/servers-pool/servers-pool.component';
import { MonitorListComponent } from './components/monitor-list/monitor-list.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'monitor-config', component: MonitorConfigComponent },
      { path: 'users-info', component: UsersInfoComponent },
      { path: 'servers-pool', component: ServersPoolComponent },
      { path: 'monitor-list', component: MonitorListComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
