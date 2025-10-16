import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'WelCome to MbokoFit Api documentation!';
  }
}
