import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as entities from '../databases/entities';

@Injectable()
export class MysqlConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const options = {
      autoLoadEntities: true,
      database: this.configService.get<string>('DB_DATABASE'),
      entities: Object.values(entities),
      host: this.configService.get<string>('DB_HOST'),
      migrationsTableName: 'migration',
      password: this.configService.get<string>('DB_PASSWORD'),
      port: this.configService.get<number>('DB_PORT'),
      synchronize: false,
      timezone: 'Z',
      type: 'mysql',
      username: this.configService.get<string>('DB_USERNAME'),
    };

    return options as TypeOrmModuleOptions;
  }
}
