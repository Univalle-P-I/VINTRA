import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UUID } from "crypto";
import { Session } from "../entities/session.entity";

@Injectable()
export class SessionService {
    constructor(
      @InjectRepository(Session)
      private readonly sessionRepo: Repository<Session>,
    ) {}

    async revokeAllTokens(idUserAccount: UUID){
    }

    async createSession(idUserAccount: UUID){
    }

    async validateToken(tokenHash: String): Promise<Boolean>{
        return false;
    }

    async  RevokeToken(idUserAccount: UUID){
    }

}