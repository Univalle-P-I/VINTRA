import { UUID } from "crypto";
import { UserAccount } from "./entities/user-account.entity";
import { UserInfoDto } from "./dto/user-info.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ChangePwdDto } from "./dto/change-pwd.dto";
import { Profile } from "../profiles/entities/profile.entity";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserService {
    constructor(
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

    async findActiveProfiles(idUserAccount: UUID): Promise<Profile[]> {
        return [];
    }

}