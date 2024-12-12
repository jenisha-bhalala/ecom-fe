import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private _totalPrice = 0;
  private _totalProducts = 0;

  constructor() { }

  set totalPrice(price: number) {
    this._totalPrice = price;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  set totalProducts(quantity: number) {
    this._totalProducts = quantity;
  }

  get totalProducts(): number {
    return this._totalProducts;
  }

}
