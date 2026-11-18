import { UUID } from "crypto";
import { UserAccount } from "./entities/user-account.entity";
import { UserInfoDto } from "./dto/user-info.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ChangePwdDto } from "./dto/change-pwd.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PasswordHasherService } from "../common/security/password-hasher.service";


@Injectable()
export class UserService {
     constructor(
      @InjectRepository(UserAccount)
      private readonly userAccountRepo: Repository<UserAccount>,
      private readonly passwordHasher: PasswordHasherService
    ) {}
    
    async findUserAccount(Email: String): Promise<UserAccount> {
        throw new Error("Method not implemented.");
    }

    async findUserInfo(idUserAccount: UUID): Promise<UserInfoDto> {
        throw new Error("Method not implemented.");
    }  

    async createNewUser(ForgotDto: CreateUserDto) {
        throw new Error("Method not implemented.");
    } 

    async changePassword(ChangePwdDto: ChangePwdDto) {
        throw new Error("Method not implemented.");
    }

    async disableUser(idUserAccount: UUID){
        throw new Error("Method not implemented.")
    }

}