import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router); // Inject the router to handle navigation
  const token = localStorage.getItem('authToken'); // Retrieve the token from local storage

  if (token) {
    return true; // Allow access if the token exists
  } else {
    router.navigate(['/login']); // Redirect to the login page if not authenticated
    return false;
  }

};
