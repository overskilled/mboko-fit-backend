import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;
}
