import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-product-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './product-not-found.component.html',
  styleUrl: './product-not-found.component.css'
})
export class ProductNotFoundComponent {
  
  constructor(private router: Router) {}

}
