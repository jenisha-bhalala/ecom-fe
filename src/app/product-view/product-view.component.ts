import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../service/auth.service';
import { CartService } from '../service/cart.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CartResponse } from '../cart.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { NgToastModule } from 'ng-angular-popup';
import { NgToastService } from 'ng-angular-popup';
import * as _ from 'lodash'
import { debounceTime, Subject, switchMap } from 'rxjs';
import { SideNavComponent } from '../side-nav/side-nav.component';


@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [
    FontAwesomeModule, 
    CommonModule, 
    FormsModule, 
    MatSnackBarModule, 
    MatIconModule, 
    NgToastModule, 
    RouterModule,
    SideNavComponent,
  ],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.css'
})


export class ProductViewComponent implements OnInit {
  
  products: any;
  defaultProducts: any;
  searchQuery: string = '';
  cartItemCount: number = 0; // Initialize the cart item count
  // bounse = false;
  filteredProducts: any;
  activeTab: string = 'allProducts';
  private searchSubject = new Subject<string>();

  pageNumber: number = 1; // Track the current page number
  pageSize: number = 16;  // Number of products per page
  totalProducts: number = 0; // Total number of products available
  totalPages: number = 0;   // Total number of pages based on products count
  

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private toast: NgToastService,
    
  ){}

  async ngOnInit() {

    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => this.cartService.searchProducts(query))
    ).subscribe(data => {
      this.products = data;
      console.log('Filtered Products in NGONINIT:', this.products);
      if (this.products.count === 0) {
        // If no products found, navigate to /productNotFound
        this.router.navigate(['/productNotFound']);
      }

    })

    this.route.queryParams.subscribe((params) => {
      const searchQuery = params['search'] || '';
      this.searchQuery = searchQuery; // Update input value for the search bar
      this.loadProducts(searchQuery); // Perform the search
    });
   await this.getProducts(this.pageNumber, this.pageSize);
   await this.updateCartCount(); 
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  // get totalPages(): number {
  //   return Math.ceil((this.products?.count || 0) / 16); // Handle undefined/null `products`
  // }
  

  logOut() {

    localStorage.removeItem('authToken'); // Example: Remove authentication token
    localStorage.clear(); // Clear all local storage if necessary

    console.log('User logged out successfully');

    // Redirect to the login page or any other page
    this.router.navigate(['/login']);
  }

  async getProducts(page: number, pageSize: number) {

    this.authService.listProducts(page, pageSize).subscribe({

      next: (data) => {

        console.log('jjjjj data', data);
        this.products = data;
        this.totalProducts = data.count;  // Total number of products
        this.totalPages = Math.ceil(this.totalProducts / pageSize);  // Calculate total pages
        this.defaultProducts = _.cloneDeep(this.products);
        // products = data;
      },

      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });

  }

    // Function to handle page change
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.pageNumber = page;
        this.getProducts(this.pageNumber, this.pageSize);  // Fetch products for the new page
      }
    }
  

  async onSearch(query: string) {
    
    this.searchQuery = query;
    this.searchSubject.next(query)
    this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { search: this.searchQuery },
          queryParamsHandling: 'merge', // Merge with existing query params
        });
  }
  // async onSearch() {
  //   this.loadProducts(this.searchQuery);
   
  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //     queryParams: { search: this.searchQuery },
  //     queryParamsHandling: 'merge', // Merge with existing query params
  //   });
  // }

  loadProducts(query: string = '') {

    console.log('query', query);

    if(query == '') {
      return;
    }
    
    this.cartService.searchProducts(query).subscribe({

      next: (data) => {
        this.products = data
    console.log('searcheddd data', data);
    console.log('searcheddd this.products', this.products);
    // if(this.products.count == 0) {
    //   this.router.navigate(['/productNotFound'])
    // }

      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    })
  }

  async updateCartCount() {
    this.cartService.getCart().subscribe({
      next: (data: CartResponse) => {
        console.log('ooooo data',data);
        console.log('ooooo data',data.totalItemInCart);
        
        this.cartItemCount = data.totalItemInCart; // Assuming the response is an array of items in the cart
      },
      error: (error) => {
        console.error('Error fetching cart data', error);
      }
    });
  }

  addToCart(productId: any) {
    let timeOut: number = 5000
    this.cartService.addItemToCart(productId).subscribe({
      next: (response) => {
        console.log('Item added to cart', response);
       this.toast.success('Item added to cart', "Success", timeOut )
        // alert('Item added to cart successfully!');
        this.updateCartCount();
        
      },

      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add item to cart.');
      }
    })

  }
  

}
