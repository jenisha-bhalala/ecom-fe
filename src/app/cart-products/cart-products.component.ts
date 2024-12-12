import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../service/auth.service';
import * as _ from 'lodash'
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../service/cart.service';
import { SharedService } from '../service/shared.service';


@Component({
  selector: 'app-cart-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-products.component.html',
  styleUrl: './cart-products.component.css'
})
export class CartProductsComponent implements OnInit {

  products: any;
  defaultProducts: any;
  cartItems: any;
  calcCart: any;
  totalPrice: number = 0
  productPrice: number = 0
  taxAmount: number = 12.50;
  shippingCharge: number = 5.50;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private sharedService: SharedService,
    private router: Router,

  ) {}

  async ngOnInit() {
    
  //  await this.getProducts();
   await this.getCartItems();
  }

  generateRandomAlphanumeric(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }

  async getCartItems() {

    this.cartService.getCart().subscribe({
      next: async (response) => {

        this.cartItems = response
        console.log('Getting user\'s cart', response);
        console.log('cartItems.cart cart', this.cartItems.cart);
        this.sharedService.totalProducts = this.cartItems.totalItemInCart
        await this.calculateTotalProductPrice();
        this.totalPayableAmount();
      }
    })
    
  }

  navigatingToCheckout() {

    const randomString = this.generateRandomAlphanumeric();

    console.log('eeeeeeee randomString', randomString);
    

    this.router.navigate([`/checkout/${randomString}`])
  }

  async changeQuan(id: number, newQuantity: number) {

    if (newQuantity < 1) {
      return; // Prevent invalid quantities
    }

    this.cartService.changeQuantity(id, newQuantity).subscribe({

      next: async (response) => {

        console.log('**** Quantity updated: ', response);

        await this.getCartItems();
        console.log('cartItems Quantity updated:', this.cartItems);
        const item = await this.cartItems.find((i: any) => i.id === id); // Replace `cartItems` with the correct array reference

        if (item) {
          item.quantity = newQuantity;
        }

      }
    })
    
  }

  deleteProductFromCart(id: number) {

    this.cartService.deleteItemFromCart(id).subscribe({

      next: async (response) => {

        console.log('**** Product deleted: ', response);

        await this.getCartItems();
        console.log('cartItems updated after DELETION:', this.cartItems);
        const item = await this.cartItems.find((i: any) => i.id === id); // Replace `cartItems` with the correct array reference


      }
    })

  }
  
  // Total price calculation

  async calculateTotalProductPrice() {

    this.productPrice = 0;
    for(let item of this.cartItems.cart) {

      this.productPrice += (item.quantity * item.product.price) 
    }
    console.log('////////////////////////productPrice: ', this.productPrice);
    
  }

  async totalPayableAmount() {

    this.totalPrice = 0;

    if(this.productPrice != 0 ) {
      this.totalPrice = this.productPrice + this.taxAmount + this.shippingCharge;
      this.sharedService.totalPrice = this.totalPrice
    }

  }
  
}
