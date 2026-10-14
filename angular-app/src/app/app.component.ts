import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/" aria-label="Facility Operations home">
          <span class="brand-mark">F<span>+</span></span>
          <span class="brand-copy"><strong>Fieldnote</strong><small>FACILITY OPERATIONS</small></span>
        </a>
        <div class="nav-label">WORKSPACE</div>
        <nav class="main-nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"><span class="nav-icon">⌂</span> Overview</a>
          <a routerLink="/facilities" routerLinkActive="active"><span class="nav-icon">▦</span> Facilities</a>
          <a routerLink="/inspections" routerLinkActive="active"><span class="nav-icon">◷</span> Inspections</a>
        </nav>
        <div class="sidebar-bottom"><span class="online-dot"></span><span>API connection</span><strong>LOCAL</strong></div>
      </aside>
      <main class="main-area">
        <header class="topbar"><span class="breadcrumb">OPERATIONS <span>/</span> <b>FACILITY HEALTH</b></span><a class="top-action" routerLink="/inspections/new"><span>＋</span> New inspection</a></header>
        <div class="page-wrap"><router-outlet /></div>
        <footer class="page-footer"><span>FIELDNOTE <span class="footer-separator">/</span> FACILITY OPERATIONS</span><span>Connected to Day-08 Laravel API</span></footer>
      </main>
    </div>
  `
})
export class AppComponent {}
