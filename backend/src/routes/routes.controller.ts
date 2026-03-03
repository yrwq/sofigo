import { Controller, Get } from '@nestjs/common';
import { RoutesService } from '@/routes/routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  async list() {
    return this.routes.listRoutes();
  }
}
