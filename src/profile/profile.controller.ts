import {Get, Post, Param, Put, Delete, Query, Controller, Body, HttpCode} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IUserProfile, UserProfile } from './models/profile.model';


@Controller('api/profiles')
// @UseGuards(AuthGuard('bearer'))
export class ProfileController {

    /**
     * Create user profile
     * @param body 
     */
    @Post()
    async create(@Body(new ValidationPipe({transform: true})) body: UserProfile) {
        return await this.profileService.createProfile(body);
    }

    /**
     * Get user profile
     * @param body 
     */
    @Get(':id')
    async findOne(@Param('id') id) {
        return await this.profileService.findProfile(id);
    }

    /**
     * Update user profile
     * @param body 
     */
    @Put(':id')
    async update(@Param('id') id, @Body(new ValidationPipe({transform: true})) body: UserProfile) {
        return await this.profileService.updateProfile(id, body);
    }

    /**
     * Delete user profile
     * @param body 
     */
    @Delete(':id')
    async remove(@Param('id') id) {
        return await this.profileService.deleteProfile(id);
    }

    /**
     * Get news (channel ws), persists the status
     * @param body 
     */
    @Get(':id/docker-news')
    async inquireNews(@Param('id') id, @Query('persist') persist) {        
        return await this.profileService.inquireDockerVersionNews(id, persist);
    }

    /**
     * Trigger notifications
     * @param body 
     */
    @Get(':id/docker-notifications')
    async doNotifications(@Param('id') id, @Query('persist') persist) {        
        return await this.profileService.doNotifications(id, persist);
    }

    constructor(private readonly profileService: ProfileService ) {        
    }
}
