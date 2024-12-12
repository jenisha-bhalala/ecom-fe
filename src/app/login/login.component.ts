import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginData = { email: '', password: ''};
  signupData = { name: '', email: '', password: ''};

  isLoginMode = true

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {

    // When the component is initialized, it subscribes to the route URL to set isLoginMode
    // isLoginMode is set to true if the URL path is /login, or false if it's /signup
    this.route.url.subscribe( urlSegments => {
      this.isLoginMode = urlSegments[0].path === 'login'
    })
  }

  onSwitchMode() {

    // this.isLoginMode = !this.isLoginMode;

    if(this.isLoginMode) {
      this.router.navigate(['/signup'])
    } else {
      this.router.navigate(['/login'])
    }
  }

  onLogin() {

    console.log('Login data:', this.loginData);
    const { email, password } = this.loginData;
    
    this.authService.loginUser(email, password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  onSignup() {

    console.log('Signup data:', this.signupData);
    const { email, name, password } = this.signupData;

    this.authService.signupUser(email, name, password).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
      },
      error: (error) => {
        console.error('Signup failed:', error);
      }
    });

  }

  
  
}
