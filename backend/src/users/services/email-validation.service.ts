import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { EmailValidationToken } from "../entities/email-validation-token.entity";

@Injectable()
export class EmailValidationService {
    constructor(
      @InjectRepository(EmailValidationToken)
      private readonly emailValidationToken: Repository<EmailValidationToken>,
    ) {}

    async validateToken(hashEmailToken: string): Promise<Boolean>{
        throw new Error("")
    }

    async generateEmailToken(): Promise<String>{
      return randomBytes(32).toString("hex");
    }
}