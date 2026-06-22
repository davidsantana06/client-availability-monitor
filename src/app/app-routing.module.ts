import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '@app/components/home/home.component';
import { LayoutComponent } from '@app/components/layout/layout.component';
import { MonitorConfigComponent } from '@app/components/monitor-config/monitor-config.component';
import { MonitorListComponent } from '@app/components/monitor-list/monitor-list.component';
import { ServersPoolComponent } from '@app/components/servers-pool/servers-pool.component';
import { UsersInfoComponent } from '@app/components/users-info/users-info.component';

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
