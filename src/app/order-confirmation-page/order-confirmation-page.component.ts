import { SharedService } from './../service/shared.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './order-confirmation-page.component.html',
  styleUrl: './order-confirmation-page.component.css'
})
export class OrderConfirmationPageComponent implements OnInit{

  orderDetails: any
  today: Date = new Date();

  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
  ) {}

  ngOnInit() {
    
    // Get the order ID from the URL
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    console.log('Order ID:', this.orderId);

  }

  get totalPrice(): number {
    return this.sharedService.totalPrice; // Access value from service
  }

}
