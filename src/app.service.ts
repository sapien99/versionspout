import { Injectable} from '@nestjs/common';

@Injectable()
export class AppService {

    constructor() {}

    healthz(): string {
        return 'UP';
    }

}
