import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ParticipationDto } from './dto/participation.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @Roles(Role.MEMBER)
  findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.eventsService.findAll({ status, dateFrom, dateTo }, userId);
  }

  @Get('upcoming')
  @Roles(Role.MEMBER)
  findUpcoming(@Query('limit') limit?: string) {
    return this.eventsService.findUpcoming(limit ? parseInt(limit) : 5);
  }

  @Public()
  @Get('public')
  findPublic() {
    return this.eventsService.findPublic();
  }

  @Get(':id')
  @Roles(Role.MEMBER)
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.findOne(id, userId);
  }

  @Post()
  @Roles(Role.AREA_MANAGER)
  create(@Body() dto: CreateEventDto, @CurrentUser('id') userId: string) {
    return this.eventsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.AREA_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/participate')
  @Roles(Role.MEMBER)
  participate(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ParticipationDto,
  ) {
    return this.eventsService.participate(eventId, userId, dto);
  }

  @Get(':id/participants')
  @Roles(Role.AREA_MANAGER)
  getParticipants(
    @Param('id') eventId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.eventsService.getParticipants(eventId, role);
  }
}
