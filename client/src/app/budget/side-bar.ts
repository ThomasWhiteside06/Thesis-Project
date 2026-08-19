import { Component } from "@angular/core";
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'budget-side-bar',
  imports:[MatIconModule],
  template: `
  <div class="icon-container">
   <mat-icon style="font-size: 58px; height: 68px; width: 78px; color:black">
  eco
</mat-icon> 
    <span>Dashboard</span>
  </div>
<div class="icon-container">
<mat-icon style="font-size: 58px; height: 68px; width: 78px; color:black">
 pie_chart
</mat-icon>
<span>Charts</span>
</div>


<div class="icon-container">
<mat-icon style="font-size: 58px; height: 68px; width: 78px; color:black">
  monetization_on
</mat-icon>
<span>Investments</span>
</div>
  `,
  styles: [`
    .icon-container{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;

    }
   .icon-container span{
      flex:1;
      color: black;
      font-weight: bold;
      text-shadow: 1px;

    } 
.icon-container:hover mat-icon,
.icon-container:hover span {
  color: lightseagreen;
}

    `]
})

export class BudgetSideBar{ }