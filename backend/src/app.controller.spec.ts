import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

describe('AppController', () => {
  it('returns the greeting from the service', () => {
    const service = new AppService();
    const controller = new AppController(service);

    expect(controller.getHello()).toBe('hello?');
  });
});
