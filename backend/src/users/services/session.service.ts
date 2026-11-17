import { Injectable } from "@nestjs/common";
import { UUID } from "crypto";

@Injectable()
export class SessionService {
    constructor(
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