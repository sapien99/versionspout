import { Logger as StandardLogger } from '@nestjs/common';
import { globals } from './env';

export class Logger extends StandardLogger {        

    static debug(...args: any[]) {        
        if (globals.log.level > 5)        
            Logger.log(args)
    }

    static info(...args: any[]) {
        if (globals.log.level > 3)        
            Logger.log(args)
    }
    
}