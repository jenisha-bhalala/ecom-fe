import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductNotFoundComponent } from './product-not-found/product-not-found.component';
import { CartProductsComponent } from './cart-products/cart-products.component';
import { authGuard } from './guards/auth.guard';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { OrderConfirmationPageComponent } from './order-confirmation-page/order-confirmation-page.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: 'login', component: LoginComponent},
    { path: 'signup', component: LoginComponent },
    { path: 'products', component: ProductViewComponent, canActivate: [authGuard]},
    { path: 'productNotFound', component: ProductNotFoundComponent},
    { path: 'yourCart', component: CartProductsComponent, canActivate: [authGuard]},
    { path: 'checkout/:randomString', component: CheckoutPageComponent, canActivate: [authGuard]},
    { path: 'order-confirmed/:orderId', component: OrderConfirmationPageComponent, canActivate: [authGuard]},
    { path: 'success', component: PaymentSuccessComponent, canActivate: [authGuard]},
    { path: '**', redirectTo: 'login' }
];
