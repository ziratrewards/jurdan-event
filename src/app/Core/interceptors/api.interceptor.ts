import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiUrl = req.url.startsWith('/api');
  
  if (isApiUrl) {
    req = req.clone({
      url: `${environment.apiUrl}${req.url.replace('/api', '')}`
    });
  }

  // Set any required headers like Authorization here.

  return next(req);
};
