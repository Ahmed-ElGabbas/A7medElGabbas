import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { NavModule } from './nav/nav.module';
import { ProjectsModule } from './projects/projects.module';
import { CertificatesModule } from './certificates/certificates.module';
import { MediaModule } from './media/media.module';
import { ContactModule } from './contact/contact.module';
import { HeroModule } from './hero/hero.module';
import { AboutModule } from './about/about.module';
import { SkillsModule } from './skills/skills.module';
import { ExperienceModule } from './experience/experience.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SiteConfigModule,
    NavModule,
    ProjectsModule,
    CertificatesModule,
    MediaModule,
    ContactModule,
    HeroModule,
    AboutModule,
    SkillsModule,
    ExperienceModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
