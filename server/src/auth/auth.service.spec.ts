import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests that a user can successfully sign in with the correct email and password
  it('test_successful_sign_in_with_correct_email_and_password', async () => {
    const email = 'test@test.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      hashedPassword,
    };
    jest.spyOn(service, 'signIn').mockImplementation(async () => user);
    const result = await service.signIn(email, password);
    expect(result).toHaveProperty('accessToken');
  });

  // Tests that an UnauthorizedException is thrown when trying to sign in with an incorrect email
  it('test_sign_in_with_incorrect_email', async () => {
    const email = 'incorrect_email@example.com';
    const pass = 'password';
    await expect(service.signIn(email, pass)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // Tests that an UnauthorizedException is thrown when trying to sign in with an incorrect password
  it('test_sign_in_with_incorrect_password', async () => {
    const email = 'test@test.com';

    const incorrectPass = 'wrong_password';
    await expect(service.signIn(email, incorrectPass)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // Tests that an UnauthorizedException is thrown when the user is not found
  it('test_throw_unauthorized_exception_when_user_not_found', async () => {
    const email = 'nonexistentuser@example.com';
    const pass = 'password';
    await expect(service.signIn(email, pass)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
