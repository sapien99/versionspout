import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor() {}

    async validateUser(token: string): Promise<any> {
        // just check if we have a valid token
        return await true;
    }
}