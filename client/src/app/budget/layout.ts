import { Component, signal, inject } from "@angular/core";
import {MatGridListModule} from '@angular/material/grid-list';
import { BudgetSideBar } from "./side-bar";
import { MainBudget } from "./main";

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text:string
}


@Component({
  selector: 'app-layout',
  imports:[MatGridListModule,BudgetSideBar,MainBudget],
  template: `
  <mat-grid-list cols="8" rowHeight="700px">
  @for (tile of tiles; track tile) {
    @if(tile.text === 'Side') {
    <mat-grid-tile 
      [colspan]="tile.cols"
      [rowspan]="tile.rows"
      [style.color]="tile.color"
      >
      <budget-side-bar class="side-bar-menu"/>
      </mat-grid-tile>
  }
 @else{
 <mat-grid-tile
      [colspan]="tile.cols"
      [rowspan]="tile.rows"
      [style.color]="tile.color"
      >
      <budget-main class="hero-main"/>

      </mat-grid-tile> 
    }
  }
  

</mat-grid-list>
  `,
  styles: [`
    
    .side-bar-menu{
      padding-top: 150px;
      background-color: rgb(227, 227, 206);
      color:brown;
      height:100%;
      width:100%;
      display: flex;
      flex-direction: column;
      gap: 200px;
      align-items: center;
      justify-content: flex-start;
      font-size: x-large;
      
      
    }

    .hero-main{
      height: 100%;
      width: 100%;
       background-color: rgb(227, 227, 206);
       display: block;
       color: brown;
       font-size: large;
    }
    `]
})

export class Layout{
tiles: Tile[] = [
    {text: 'Side', cols: 1, rows: 2, color: 'lightgrey'},
    {text: 'Main', cols: 7, rows: 2, color: 'white'},
    
  ];
}