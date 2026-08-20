import { Component, inject ,input,computed,effect,Output,EventEmitter} from "@angular/core";
import { TabState } from "./tab-state";
import { Tab } from "./tabs";
import { contentChildren } from '@angular/core';
@Component({
  selector: 'budget-tab-group',
  providers:[TabState],
  template: `
<ng-content select="[tab-buttons]"/>
  
  

<ng-content select="budget-tab"/>


 
 
 `,
  styles: [``]
})

export class TabGroup{
  readonly state = inject(TabState)
  readonly tabs = contentChildren(Tab);
 @Output() tabActivated = new EventEmitter<string>(); 
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