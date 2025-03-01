import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabNavigationComponent } from './components/tab-navigation/tab-navigation.component';
import { ColumnSelectorComponent } from './components/column-selector/column-selector.component';
import { DataTableComponent } from './components/data-table/data-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TabNavigationComponent,
    ColumnSelectorComponent,
    DataTableComponent
  ],
  template: `
    <div class="app-container min-h-screen bg-gray-900">
      <header class="bg-gray-800 shadow-lg py-4 px-4">
        <h1 class="text-2xl font-bold text-gray-100">disCo Web Service</h1>
      </header>

      <main class="w-full px-4">
        <app-tab-navigation></app-tab-navigation>

        <div class="mt-4 flex gap-4">
          <div class="w-48 flex-shrink-0">
            <app-column-selector></app-column-selector>
          </div>

          <div class="flex-1 min-w-0">
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
