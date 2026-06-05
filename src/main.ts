import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = app.get(ConfigService);
  const frontendUrl =
    config.get<string>("FRONTEND_URL") ?? "http://localhost:5173";
  const allowedOrigins = frontendUrl.split(",").map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
  });

  const port = process.env.PORT || config.get<number>("PORT") || 3001;
  await app.listen(port);
}

void bootstrap();
