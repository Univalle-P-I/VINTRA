import { Exclude, Expose } from 'class-transformer';
import type { documentType } from '../../common/enums/document-type.enum.js';
import type { userStatus } from '../../common/enums/user-status.enum.js';
import type { UserAccount } from '../entities/user-account.entity.js';

@Exclude()
export class UserInfoDto {
  @Expose()
  id!: string;

  @Expose()
  documentType!: documentType;

  @Expose()
  documentId!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string;

  @Expose()
  userStatus!: userStatus;

  @Expose()
  emailVerifiedAt!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(user: UserAccount) {
    Object.assign(this, {
      id: user.id,
      documentType: user.documentType,
      documentId: user.documentId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userStatus: user.userStatus,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
