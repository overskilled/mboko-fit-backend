import { AuthService } from './auth.service';
import { SignUpDto } from './signup.dto';
import { SignInDto } from './signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signUpDto: SignUpDto): Promise<import("./auth.service").AuthResult>;
    signIn(signInDto: SignInDto): Promise<import("./auth.service").AuthResult>;
}
