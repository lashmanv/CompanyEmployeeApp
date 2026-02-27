import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Company &amp; Employee CRUD</h1>
    <p class="intro">Learning app: Angular frontend + C# .NET API with simple OOP concepts.</p>
    <ul class="links">
      <li><a routerLink="/companies">Companies</a> – List, add, edit, delete companies.</li>
      <li><a routerLink="/employees">Employees</a> – List, add, edit, delete employees and view details.</li>
    </ul>
  `,
  styles: [`
    .intro { margin: 1rem 0; color: #444; }
    .links { list-style: none; padding: 0; }
    .links li { margin: 0.5rem 0; }
    .links a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .links a:hover { text-decoration: underline; }
  `]
})
export class HomeComponent {}
