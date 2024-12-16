import { SharedService } from './../service/shared.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../service/cart.service';
import { OrderCreateService } from '../service/order-create.service';

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

  taxAmount = this.sharedService.taxAmount;
  shippingCharge = this.sharedService.shippingCharge;

  cartItems: any;
  totalPrice: number = 0
  productPrice: number = 0
  totalAmount: any = 0

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private orderCreateService: OrderCreateService,
  ) {}

  async ngOnInit() {

    // Extract the orderId from the route parameters
   this.orderId = this.route.snapshot.paramMap.get('orderId');

   // If orderId includes both parts (e.g., "30-1JVnTNkUe3"), split it
   if (this.orderId) {
     const [id, uniqueKey] = this.orderId.split('-');
     console.log('Order ID:', id); // "30"
     console.log('Unique Key:', uniqueKey); // "1JVnTNkUe3"

   }

   await this.getOrder();

  }

  convertToIST(utcDate: string): string {
    const date = new Date(utcDate);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }


  async getOrder() {

    const id = this.orderId!.split('-')[0];

    this.orderCreateService.getOrderDetails(id).subscribe({

      next: async (response: any) => {

        console.log('uuuuuuuuuu res', response);

        this.orderDetails = response;
        
      }
    })
  }
}
