// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabNavigationComponent } from './components/tab-navigation/tab-navigation.component';
import { ColumnSelectorComponent } from './components/column-selector/column-selector.component';
import { DataTableComponent } from './components/data-table/data-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TabNavigationComponent,
    ColumnSelectorComponent,
    DataTableComponent
  ],
  template: `
    <div class="app-container min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm py-4 px-6 mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Firestore Data Manager</h1>
      </header>

      <main class="container mx-auto px-4">
        <app-tab-navigation></app-tab-navigation>

        <div class="mt-4 grid grid-cols-12 gap-4">
          <div class="col-span-2">
            <app-column-selector></app-column-selector>
          </div>

          <div class="col-span-10">
            <app-data-table></app-data-table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'firestore-data-manager';
}
