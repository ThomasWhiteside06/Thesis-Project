import { Injectable ,signal } from "@angular/core";

@Injectable()
export class TabState{
  readonly activeTab = signal<string>('')
  activate(label: string) {
    this.activeTab.set(label)
  }
}