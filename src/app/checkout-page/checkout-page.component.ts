import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CountryService } from '../service/country.service';
import { ShippingAddressService } from '../service/shipping-address.service';
import { pick } from 'lodash';
import { OrderCreateService } from '../service/order-create.service';
import { StripeService } from '../service/stripe.service';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeCardCvcElement, StripeCardElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { SharedService } from '../service/shared.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CartService } from '../service/cart.service';
import { AuthService } from '../service/auth.service';
const stripePromise = loadStripe(environment.stripe_public_key);

interface PaymentIntentResponse {
  client_secret: string;
  id: string;
}
@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent implements OnInit {

  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  elements: StripeElements | null = null;
  @ViewChild('cardInfo', { static: false }) cardInfo: ElementRef | undefined;    // hereyou need to update your html by adding 'cardInfo'


  public areCardFieldsValid: () => boolean = () => false;


  private cardNumber!: StripeCardNumberElement;
  private cardExpiry!: StripeCardExpiryElement;
  private cardCvc!: StripeCardCvcElement;

  shippingAddressForm: FormGroup;
  paymentForm!: FormGroup;
  
  isStripeModalOpened: boolean = false
  email: any
  deliveryOption: any
  paymentFailedMsg!: string;
  paymentDate: any;
  paymentIntentId: any;
  addressId: any;
  orderRes: any;
  clientSecret: any;
  cardNumberError: boolean = false;
  cardExpiryError: boolean = false;
  cardCVVError: boolean = false;
  showPaymentFailed: boolean = false;
  cardErrors: any = {
    cardNumber: 1,
    cardExpiry: 1,
    cardCvc: 1
  };
  selectedCountry: any = {};
  selectedState: any = {};
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  order = { id: 'testid' };

  taxAmount = this.sharedService.taxAmount;
  shippingCharge = this.sharedService.shippingCharge;

  cartItems: any;
  totalPrice: number = 0
  productPrice: number = 0

  userId: any;
  loggedInUserEmail: any;
  isSubscribed: boolean = false;
  selectedPlan: 'monthly' | 'yearly' | 'oneDay' = 'monthly'; // Default plan

  plans: { 
    monthly: { price: number; duration: string; discount: string; link: string; priceId: string }; 
    yearly: { price: number; duration: string; discount: string; link: string; priceId: string }; 
    oneDay: { price: number; duration: string; discount: string; link: string; priceId: string }; 
  } = {
    monthly: {
      price: 28.00,
      duration: 'MONTH',
      discount: 'No Discount',
      link: 'https://buy.stripe.com/test_fZe28jaWKb7s3jW001',
      priceId: 'price_1QXasXGYiJ6IfSzHtA64FWno'
    },
    yearly: {
      price: 299.00,
      duration: 'YEAR',
      discount: 'Up to 60% OFF 💰',
      link: 'https://buy.stripe.com/test_dR600b9SG0sO2fSfZ0',
      priceId: 'price_1QXb02GYiJ6IfSzH0wg3QuHX'
    },
    oneDay: {
      price: 10.00,
      duration: 'DAY',
      discount: 'NO OFF',
      link: 'https://buy.stripe.com/test_28ocMX4ymfnIf2E147',
      priceId: 'price_1QZ5XPGYiJ6IfSzHFakxOj93'
    },
  };



  constructor(
    private fb: FormBuilder,
    private router: Router,
    private countryService: CountryService,
    private shipAddress: ShippingAddressService,
    private stripeService: StripeService,
    private sharedService: SharedService,
    private cartService: CartService,
    private authService: AuthService,
  ) {
    this.shippingAddressForm = this.fb.group({
      fName: ['', Validators.required],
      lName: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', Validators.required],
      lineOne: ['', Validators.required],
      lineTwo: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
      paymentMethod: ['cod', Validators.required], // Default to COD
      cardNumber: [''],
      expire: [''],
      cvc: [''],
    });

  }

  async ngOnInit() {

    await this.loadCountries();

    await this.getCartItems();

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: ['', Validators.required]
    });

    // Set default country as India
    const defaultCountry = 'India';
    this.shippingAddressForm.controls['country'].setValue(defaultCountry);

    // Find the default country object (India)
    console.log('OOOOOOOOOOOOOOOON ', this.countries);
    
    this.selectedCountry = this.countries.find(country => country.name === defaultCountry);

    // Load states for India
    if (this.selectedCountry) {
      console.log('OOOOOOOOOOOOOOOON ');
      
      this.loadStates(this.selectedCountry.iso2);
    }

    // Trigger the loading of cities for India after loading states
    this.loadCities(this.selectedCountry.iso2, 'IN'); // Assuming 'IN' is the state ISO2 for India

    // Set placeholder values for state and city
    this.shippingAddressForm.controls['state'].setValue('');
    this.shippingAddressForm.controls['city'].setValue('');

  }

  get currentPlan() {
    return this.plans[this.selectedPlan];
  }

  onPlanChange(plan: 'monthly' | 'yearly' | 'oneDay') {
    this.selectedPlan = plan;
  }

  async goToSubscription() {
    const plan = this.plans[this.selectedPlan];
    if (plan && plan.priceId) {

      console.log('jjjjjjj plan.priceId', plan.priceId);
      
      const response: any = await this.stripeService.createCheckoutSub(this.userId, plan.priceId, this.loggedInUserEmail)

      console.log('eeeeeee response', response);

      if (response && response.url) {
        // Redirect the user to the Stripe Checkout session
        window.location.href = response.url;
      } else {
        console.error('No subscription URL returned.');
      }


    }
  }

  async getCartItems() {

    this.cartService.getCart().subscribe({
      next: async (response) => {

        this.cartItems = response;
        this.userId = this.cartItems?.cart?.[0]?.userId;
        console.log('Getting user\'s cart', response);
        console.log('cartItems.cart cart', this.cartItems.cart);
        console.log('userId', this.userId);
        await this.getUserData(this.userId);
        this.sharedService.totalProducts = this.cartItems.totalItemInCart
        await this.calculateTotalProductPrice();
        this.totalPayableAmount();
      }
    })
    
  }

  async getUserData(userId: any) {

    if (userId) {
      this.authService.getUserById(userId).subscribe({
        next: async (response: any) => {
          this.isSubscribed = response.isSubscribed;
          this.loggedInUserEmail = response.email;
          console.log('User info:', response);
        },
        error: (err: any) => {
          console.error('Failed to fetch user info:', err);
        },
      });
    }
  }


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
    }

  }

  // Load states for selected country
  loadStates(countryIso2: string): void {
    this.countryService.apiStates(countryIso2).subscribe(states => {
      this.states = states.sort((a: any, b: any) => a.name.localeCompare(b.name));

      // Reset the state and city dropdowns
      this.shippingAddressForm.controls['state'].setValue('');
      this.cities = []; // Reset cities when states are loaded
    });
  }

  // Load cities for the selected country and state
  loadCities(countryIso2: string, stateIso2: string): void {
    this.countryService.apiCities(countryIso2, stateIso2).subscribe(cities => {
      this.cities = cities;

      // Set city dropdown to empty (Select City) initially
      this.shippingAddressForm.controls['city'].setValue('');
    });
  }

  get totalProduct(): number {
    return this.sharedService.totalProducts; // Access value from service
  }

  generateUniqueOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }

  async initPaymentEvent(paymentAmount: number) {

    if(this.shippingAddressForm.get('paymentMethod')?.value == 'card') {

      console.log('xxx paymentAmount===>', paymentAmount);
      const payload = {
        receiptEmail: this.loggedInUserEmail,
        // receiptEmail: this.shippingAddressForm.get('email')?.value || '',
        quantity: this.totalProduct,
        paymentType: 'ONE_TIME'
      }
      const amountInCents = Math.round(paymentAmount * 100);


      const paymentIntentData: any = await this.stripeService.createPaymentIntentFunction(amountInCents, 'USD', payload);
    
      console.log('ppppp paymentIntentData', paymentIntentData);
      

      this.clientSecret = paymentIntentData['clientSecret'];
      this.paymentIntentId = paymentIntentData['paymentIntentId'];

      this.stripe = await stripePromise;
      const clientSecret = this.clientSecret;

      if(this.stripe) {

        const appearance = { }

        this.elements = this.stripe?.elements({
          clientSecret,
          appearance,
        });

        const inputCss = {
          color: '#2F3436',
          fontWeight: '450',
          fontFamily: 'Circular Std Book, sans-serif',
          fontSize: '14px',
          fontStyle: 'normal',
          '::placeholder': {
            color: '#879297',
          }
        };

        this.cardNumber = this.elements.create('cardNumber', {
          style: {
            base: inputCss,
            invalid: {
              color: '#2F3436',
            },
          }
        });

        this.cardExpiry = this.elements.create('cardExpiry', {
          style: {
            base: inputCss,
            invalid: {
              color: '#EB6036',
            }
          }
        });

        this.cardCvc = this.elements.create('cardCvc', {
          style: {
            base: inputCss,
            invalid: {
              color: '#EB6036',
            }
          }
        });

        this.cardNumber.mount('#card-number-element');
        this.cardExpiry.mount('#card-expiry-element');
        this.cardCvc.mount('#card-cvc-element');

        const handleCardChange = (elementName: any, event: any) => {
          this.showPaymentFailed = false;
          this.paymentFailedMsg = '';
          if (event.complete) {        
            this.cardErrors[elementName] = '';
            this.setStripeElementErrorFlag(elementName, false)
          } else if (event.empty) {
            this.setStripeElementErrorFlag(elementName, false)
          } else if (event.error) {
            this.cardErrors[elementName] = event.error.message;
            this.setStripeElementErrorFlag(elementName, true)
          } else {
            this.cardErrors[elementName] = 'Card information is incomplete or invalid';
          }
        };

        this.cardNumber.on('change', (event) => handleCardChange('cardNumber', event));
        this.cardExpiry.on('change', (event) => handleCardChange('cardExpiry', event));
        this.cardCvc.on('change', (event) => handleCardChange('cardCvc', event));
        this.areCardFieldsValid = () => {
        return Object.values(this.cardErrors).every(error => error === '');
      };

      }

      console.log('Stripe Elements initialized:', this.elements);

    }
  }

  async handleConfirmPayment() {

    console.log('this.stripe', this.stripe);

    if (!this.stripe || !this.elements) {
      console.error('Stripe has not been initialized.');
      return;
    }

    const billingCountry = this.countries.find(country => country.name == this.shippingAddressForm.get('country')!.value);
    const countryCode = billingCountry['iso2'];

    const { error, paymentMethod } = await this.stripe!.createPaymentMethod({
      type: 'card',
      card: this.cardNumber,
      billing_details: {
        name: `${this.shippingAddressForm.get('fName')!.value} ${this.shippingAddressForm.get('lName')!.value}`,
        email: this.shippingAddressForm.get('email')!.value,
        phone: this.shippingAddressForm.get('telephone')!.value,
        address: {
          city: this.shippingAddressForm.get('city')!.value,
          country: countryCode,
          line1: this.shippingAddressForm.get('lineOne')!.value,
          line2: this.shippingAddressForm.get('lineTwo')!.value,
          postal_code: this.shippingAddressForm.get('pincode')!.value,
          state: this.shippingAddressForm.get('state')!.value,
        }
      },
      metadata: {
        // lineItems: JSON.stringify(this.order?.lintedItems),
      }    
    });

    console.log('Payment Method created:', paymentMethod);

    if (error) {
      console.error('Error:', error);
      if (error.code === 'card_declined') {
          this.paymentFailedMsg = "Your card was declined.";
      } else if (error.code === 'insufficient_funds') {
          this.paymentFailedMsg = "Insufficient funds.";
      } else {
          this.paymentFailedMsg = 'An error occurred while processing your payment.';
      }
      // this.showPaymentFailed = true;
      // this.savingOrder = false;
    } else {

      // Send the token to your server to process the payment
      try {
        console.log('qqqqqqqqq paymentMethod.id: ',paymentMethod.id, 'qqqqqqqqq paymentIntentId : ', this.paymentIntentId);
        
        const confirmPayment = await this.stripeService.confirmPaymentIntentFunction(
          paymentMethod.id,
          this.paymentIntentId
        );
        console.log('+++++++++++++ confirmPayment: ',confirmPayment);

        if (confirmPayment['paymentIntent']['status'] == "succeeded") {
            // this.order['payment_intent'] = confirmPayment['paymentIntent']['id'];
            
            const uniqueOrderId = this.generateUniqueOrderId();
            this.order['id'] = uniqueOrderId; // Store the ID in your order object


            await this.confirmingOrder();
            console.log('222222222222222222222222222 response', this.orderRes);

            this.router.navigate([`/order-confirmed/${this.orderRes.id}-${uniqueOrderId}`]);
            const currentDate = new Date();
            this.paymentDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
            this.paymentFailedMsg = "";
        } else {
            this.paymentFailedMsg = 'An error occurred while processing your payment.';
            console.error('Payment not succeeded:', confirmPayment);
        }
      } catch (e) {
          const err = (e as any).error || e;
          if (err.code === 'card_declined') {
              this.paymentFailedMsg = err.message;
          } else if (err.code === 'insufficient_funds') {
              this.paymentFailedMsg = err.message;
          } else {
              this.paymentFailedMsg = 'An error occurred while processing your payment.';
              console.error('Unhandled error:', e);
          }
          console.log('this.paymentFailedMsg:', this.paymentFailedMsg);
      }
    }

  }

  setStripeElementErrorFlag(elementName: string, isErr: any){
    if (elementName === 'cardNumber') {
      this.cardNumberError = isErr ? true : false;
    }
    if (elementName === 'cardExpiry') {
      this.cardExpiryError = isErr ? true : false;
    }
    if (elementName === 'cardCvc') {
      this.cardCVVError = isErr ? true : false;
    }
  }

  async codHandlePayment() {

    const uniqueOrderId = this.generateUniqueOrderId();
    this.order['id'] = uniqueOrderId; // Store the ID in your order object

    await this.confirmingOrder();
    this.router.navigate([`/order-confirmed/${this.orderRes.id}-${uniqueOrderId}`]);

  }

  // Dynamically add or remove validators based on payment method
  setupPaymentValidation() {
    this.shippingAddressForm.get('paymentMethod')?.valueChanges.subscribe((paymentMethod) => {
      if (paymentMethod === 'card') {
        // Add validators for card fields
        this.shippingAddressForm.get('cardNumber')?.setValidators(Validators.required);
        this.shippingAddressForm.get('expire')?.setValidators(Validators.required);
        this.shippingAddressForm.get('cvc')?.setValidators(Validators.required);
      } else {
        // Remove validators for card fields
        this.shippingAddressForm.get('cardNumber')?.clearValidators();
        this.shippingAddressForm.get('expire')?.clearValidators();
        this.shippingAddressForm.get('cvc')?.clearValidators();
      }

      // Update validity status
      this.shippingAddressForm.get('cardNumber')?.updateValueAndValidity();
      this.shippingAddressForm.get('expire')?.updateValueAndValidity();
      this.shippingAddressForm.get('cvc')?.updateValueAndValidity();
    });
  }
  async loadCountries() {
    try {
      // Convert the Observable to a Promise and await its result
      const data = await this.countryService.apiCountries().toPromise();
      this.countries = data;
      console.log('COUNTRIES', this.countries);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  }
  

  onCountrySelect(event: Event): void {

    const selectElement = event.target as HTMLSelectElement;
    const selectedCountry = selectElement.value;
    this.selectedCountry = this.countries.find(country => country.name == selectedCountry);

    console.log('selectedCountry', selectedCountry);

    console.log('Find selectedCountry', this.selectedCountry);

    if (selectedCountry) {
      this.shippingAddressForm.controls['state'].setValue('');
      this.shippingAddressForm.controls['city'].setValue('');
      this.states = [];
      this.cities = [];
      this.countryService.apiStates(this.selectedCountry.iso2).subscribe(data => {
        console.log('DATA STATE', data);
        // this.states = data;
        this.states = data.sort((a: any, b: any) => a.name.localeCompare(b.name));;

      });

    }
  }


  onStateSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    const selectedCountry = this.shippingAddressForm.controls['country'].value;
    this.selectedCountry = this.countries.find(country => country.name == selectedCountry);
    const selectedState = selectElement.value;
    this.selectedState = this.states.find(state => state.name == selectedState);


    console.log('this.selectedCountry', this.selectedCountry);
    console.log('this.selectedState', this.selectedState);
    console.log('selectedCountry', selectedCountry);
    console.log('selectedState', selectedState);

    if (selectedState && selectedCountry) {
      this.shippingAddressForm.controls['city'].setValue('');
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      
      // this.cities = [];
      this.countryService.apiCities( this.selectedCountry.iso2, this.selectedState.iso2).subscribe(async data => {
        console.log('DATA CITY', data);

        this.cities = await data;

      });
    }

     // Set the first city as the default
    if (this.cities.length > 0) {
      console.log('in if of stateSelect');

      const firstCity = this.cities[0].name;
      this.shippingAddressForm.patchValue({ city: firstCity });
    }
    console.log('this.cities', this.cities);

  }

  async onSubmit() {

    if (this.shippingAddressForm.valid) {
      const address = this.shippingAddressForm.value;
      const cleanedPayload = pick(this.shippingAddressForm.value, [
        'lineOne',
        'lineTwo',
        'pincode',
        'country',
        'state',
        'city',
        'telephone'
      ]);
      console.log('Form Submitted:', address);
      (await (this.shipAddress.uploadAddress(cleanedPayload))).subscribe({
        next: async (response: any) => {
          console.log('Address submitted successfully:', response);
          this.addressId = response.id;
        },
        error: (error: any) => {
          console.error('Error submitting address:', error);
        },
      });
    } else {
      console.error('Shipping form is invalid');
    }
  }

  async confirmingOrder() {
    const selectedPaymentMethod = this.shippingAddressForm.get('paymentMethod')!.value;
  
    // Convert Observable to Promise
    const response = await (await this.shipAddress.confirmOrder(this.addressId, this.totalPrice, selectedPaymentMethod));
  
    this.orderRes = response;
    console.log('hhhhhhhhhhhhhhhhhh confirmed');
    console.log('hhhhhhhhhhhhhhhhhh response', this.orderRes);
  } 

}

