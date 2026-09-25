import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Simple guard used to demonstrate bearer-auth detection by nest-scramble.
 * In a real app this would validate a JWT.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Lenient for demo purposes so generated scenarios can run end-to-end.
    // nest-scramble still detects the guard and emits bearerAuth security schemes.
    return true;
  }
}
