import { Component, inject ,input,computed,effect} from "@angular/core";
import { TabState } from "./tab-state";
import { Tab } from "./tabs";
import { contentChildren } from '@angular/core';
@Component({
  selector: 'budget-tab-group',
  providers:[TabState],
  template: `
<div class="tab-header">
  @for (tab of tabs(); track tab.label()) {
    <button
      (click)="activate(tab.label())"
      class="tab-button"
      [class.active]="state.activeTab() === tab.label()"
    >
      {{ tab.label() }}
    </button>
  }
</div>

<ng-content />
 
 
 `,
  styles: [`
  
.tab-header {
  border-bottom: 1px solid #e5e7eb; 
  display: flex;
  gap: 1rem; 
}


.tab-button {
  padding: 10px 28px; 
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  font-weight: 500; 
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}


.tab-button.active {
  border-bottom-color: #16181c; 
 
  color: #187d3d; 
 
}


.tab-button:not(.active):hover {
  color: #555;
}

  `]
})

export class TabGroup{
  readonly state = inject(TabState)
  readonly tabs = contentChildren(Tab);

  constructor() {
    effect(() => {
      const allTabs = this.tabs()
      if (allTabs.length > 0 && !this.state.activeTab()) {
        this.state.activate(allTabs[0].label())
      }
    })
  }
  activate(label: string) {
    this.state.activate(label)
  }
}