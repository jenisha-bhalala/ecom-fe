
// cart.model.ts
export interface CartResponse {
    totalItemInCart: number;  // The total number of items in the cart
    items: any[];              // The array of cart items (you can adjust the type as per your needs)
    userId: any;
  }
  