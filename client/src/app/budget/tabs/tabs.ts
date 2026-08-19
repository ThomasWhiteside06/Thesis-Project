import { Component, inject,input, signal ,computed} from "@angular/core";
import { TabState } from "./tab-state";

@Component({
  selector: 'budget-tab',
  template: `
  @if (isActive()) {

 <div class="tab-content">
  <ng-content />
</div> 
  }
  `,
  styles: [`
    .tab-content {
  padding: 20px 20px;
  animation: fadeIn 300ms ease-in forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

    
    
    `]
})

export class Tab{
  readonly state = inject(TabState)
  readonly label = input.required<string>();
  readonly isActive = computed( () => this.state.activeTab() === this.label())
}